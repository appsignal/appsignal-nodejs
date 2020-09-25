#[macro_use]
extern crate neon;

use neon::prelude::*;
use neon::{register_module};

fn start(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

fn stop(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

register_module!(mut m, {
    m.export_function("start", start);
    m.export_function("stop", stop);
    Ok(());
});
