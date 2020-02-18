{
  "targets":[
    {
      "target_name": "extension",
      "sources":[
        "ext/appsignal_extension.cpp"
      ],
      "libraries":[
        "../ext/libappsignal.a"
      ],
      "include_dirs":[
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies":[
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines":[
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],
      "conditions":[
        [
          "OS=='mac'",
          {
            "cflags+":[
              "-fvisibility=hidden"
            ],
            "xcode_settings":{
              "GCC_SYMBOLS_PRIVATE_EXTERN":"YES"
            }
          }
        ]
      ]
    }
  ]
}
