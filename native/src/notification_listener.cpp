#include "notification_listener.h"
#include <windows.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.UI.Notifications.h>
#include <winrt/Windows.UI.Notifications.Management.h>
#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <iostream>
#include <thread>
#include <iomanip>
#include <sstream>

using namespace winrt;
using namespace Windows::UI::Notifications;
using namespace Windows::UI::Notifications::Management;

Napi::ThreadSafeFunction WinNotificationListener::jsCallback;
bool WinNotificationListener::isListening = false;
winrt::event_token listenerToken;

// Helper to generate ISO timestamp
std::string GetCurrentTimestamp() {
    SYSTEMTIME st;
    GetSystemTime(&st);
    std::ostringstream oss;
    oss << st.wYear << "-" 
        << std::setfill('0') << std::setw(2) << st.wMonth << "-"
        << std::setfill('0') << std::setw(2) << st.wDay << "T"
        << std::setfill('0') << std::setw(2) << st.wHour << ":"
        << std::setfill('0') << std::setw(2) << st.wMinute << ":"
        << std::setfill('0') << std::setw(2) << st.wSecond << "."
        << std::setfill('0') << std::setw(3) << st.wMilliseconds << "Z";
    return oss.str();
}

void WinNotificationListener::Initialize(Napi::ThreadSafeFunction tsfn) {
    if (isListening) return;
    jsCallback = tsfn;
    
    // BUG FIX: Spawn a background thread so the Windows Permission prompt doesn't freeze the Electron UI!
    std::thread([]() {
        try {
            init_apartment();
            UserNotificationListener listener = UserNotificationListener::Current();
            
            // This OS prompt blocks the background thread, not the UI
            auto accessStatus = listener.RequestAccessAsync().get();
            
            if (accessStatus != UserNotificationListenerAccessStatus::Allowed) {
                std::cerr << "[Native] Access to notifications was denied by Windows." << std::endl;
                return;
            }

            SubscribeToEvents();
            isListening = true;
            std::cout << "[Native] Successfully hooked into Windows Notification pipeline." << std::endl;

        } catch (winrt::hresult_error const& ex) {
            std::cerr << "[Native] WinRT Error: " << winrt::to_string(ex.message()) << std::endl;
        } catch (...) {
            std::cerr << "[Native] Unknown error during initialization." << std::endl;
        }
    }).detach();
}

void WinNotificationListener::SubscribeToEvents() {
    UserNotificationListener listener = UserNotificationListener::Current();
    
    listenerToken = listener.NotificationChanged([](const UserNotificationListener& sender, const UserNotificationChangedEventArgs& args) {
        if (args.ChangeKind() == UserNotificationChangedKind::Added) {
            try {
                auto notif = sender.GetNotification(args.UserNotificationId());
                if (!notif) return;

                std::string appName = winrt::to_string(notif.AppInfo().DisplayInfo().DisplayName());
                std::string notifId = std::to_string(notif.Id());
                std::string title = "";
                std::string body = "";
                
                auto bindings = notif.Notification().Visual().Bindings();
                if (bindings.Size() > 0) {
                    auto textElements = bindings.GetAt(0).GetTextElements();
                    if (textElements.Size() > 0) title = winrt::to_string(textElements.GetAt(0).Text());
                    if (textElements.Size() > 1) body = winrt::to_string(textElements.GetAt(1).Text());
                }

                std::string timestamp = GetCurrentTimestamp();

                jsCallback.BlockingCall([appName, title, body, notifId, timestamp](Napi::Env env, Napi::Function jsFunc) {
                    Napi::Object obj = Napi::Object::New(env);
                    obj.Set("appName", appName);
                    obj.Set("title", title);
                    obj.Set("body", body);
                    obj.Set("notifId", notifId);
                    obj.Set("timestamp", timestamp);
                    jsFunc.Call({ obj });
                });
            } catch(...) {} // Ignore parse errors for individual noisy notifications
        }
    });
}

void WinNotificationListener::Shutdown() {
    if (!isListening) return;
    try {
        UserNotificationListener listener = UserNotificationListener::Current();
        listener.NotificationChanged(listenerToken);
        jsCallback.Release();
        isListening = false;
    } catch (...) {}
}
