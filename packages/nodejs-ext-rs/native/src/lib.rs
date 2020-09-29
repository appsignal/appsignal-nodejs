#[macro_use]
extern crate neon;

use neon::prelude::*;
use neon::register_module;

fn start(mut cx: FunctionContext) -> JsResult<JsNull> {
    appsignal::start(false);
    Ok(cx.null())
}

fn stop(mut cx: FunctionContext) -> JsResult<JsNull> {
    appsignal::stop();
    Ok(cx.null())
}

fn diagnose(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string(""))
}

register_module!(mut m, {
    m.export_function("start", start);
    m.export_function("stop", stop);
    m.export_function("diagnose", diagnose);
    Ok(())
});
