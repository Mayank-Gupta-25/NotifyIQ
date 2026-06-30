#pragma once
#include <napi.h>

class WinNotificationListener {
public:
    static void Initialize(Napi::ThreadSafeFunction tsfn);
    static void Shutdown();
    
private:
    static Napi::ThreadSafeFunction jsCallback;
    static bool isListening;
    static void SubscribeToEvents();
};
