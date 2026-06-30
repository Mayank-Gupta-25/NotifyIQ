{
  "targets": [
    {
      "target_name": "win_notification_listener",
      "sources": [
        "src/addon.cpp",
        "src/notification_listener.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "libraries": [
        "-lruntimeobject.lib"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "AdditionalOptions": [ "/std:c++17", "/await" ]
        }
      },
      "defines": [ "NAPI_VERSION=8", "NAPI_CPP_EXCEPTIONS" ]
    }
  ]
}
