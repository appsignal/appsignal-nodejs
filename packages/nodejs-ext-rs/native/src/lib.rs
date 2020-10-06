#[macro_use]
extern crate neon;
extern crate serde;
extern crate serde_json;

extern crate appsignal;
extern crate appsignal_common as common;

use std::collections::HashMap;

use neon::prelude::*;
use neon::register_module;

use common::config::Config;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

fn start(mut cx: FunctionContext) -> JsResult<JsNull> {
    appsignal::start(false);
    Ok(cx.null())
}

fn stop(mut cx: FunctionContext) -> JsResult<JsNull> {
    appsignal::stop();
    Ok(cx.null())
}

fn diagnose(mut cx: FunctionContext) -> JsResult<JsString> {
    let mut extension_report = HashMap::new();

    let config = match Config::from_env(local_env_clone()) {
        Ok(config) => {
            extension_report.insert("config", json!({ "valid": { "result": true } }));
            config
        }
        Err(e) => {
            return json_string(json!({
                "extension": {
                    "config": {
                        "valid": {
                            "result": false,
                            "error": format!("{:?}", e)
                        }
                    }
                }
            }));
        }
    };

    // Run diagnose
    let agent_output = appsignal::diagnose(config);

    // Parse agent json output and add to diagnose report
    let agent_report: Value = match serde_json::from_str(&agent_output) {
        Ok(value) => value,
        Err(e) => json!({
            "boot": {
                "started": {
                    "result": false,
                    "error": format!("{:?}", e),
                    "output": agent_output
                }
            }
        }),
    };

    let report = json!({
        "extension": extension_report,
        "agent": agent_report,
    });

    let json = match serde_json::to_string(&report) {
        Ok(value) => cx.string(value),
        Err(e) => cx.string(format!(r#"{{ "error": "{:?}" }}"#, e)),
    };

    Ok(json)
}

register_module!(mut m, {
    m.export_function("start", start);
    m.export_function("stop", stop);
    m.export_function("diagnose", diagnose);
    Ok(())
});
