#include <napi.h>
#include "notification_listener.h"

Napi::Value StartListening(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(env, "Expected a callback function").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Function callback = info[0].As<Napi::Function>();
    Napi::ThreadSafeFunction tsfn = Napi::ThreadSafeFunction::New(
        env,
        callback,
        "NotificationListenerCallback",
        0,
        1
    );

    WinNotificationListener::Initialize(tsfn);
    return env.Null();
}

Napi::Value StopListening(const Napi::CallbackInfo& info) {
    WinNotificationListener::Shutdown();
    return info.Env().Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "startListening"), Napi::Function::New(env, StartListening));
    exports.Set(Napi::String::New(env, "stopListening"), Napi::Function::New(env, StopListening));
    return exports;
}

NODE_API_MODULE(win_notification_listener, Init)
