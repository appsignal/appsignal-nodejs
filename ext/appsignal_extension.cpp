#include <napi.h>

#include <iostream>

extern "C" {
#include "appsignal.h"
}

// Make an appsignal string struct out of a UTF-8 string. Warning: The provided
// value has to stay an in scope for as long as the appsignal string is used.
// Node will free it immediately after it goes out of scope and accessing the
// string will result in random memory access.
static inline appsignal_string_t MakeAppsignalString(const std::string &value) {
  return appsignal_string_t{.len = value.size(), .buf = value.c_str()};
}

// Extension

Napi::Value Start(const Napi::CallbackInfo &info) {
  appsignal_start();
  return info.Env().Null();
}

Napi::Value Stop(const Napi::CallbackInfo &info) {
  appsignal_stop();
  return info.Env().Null();
}

Napi::Value DiagnoseRaw(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  appsignal_string_t str = appsignal_diagnose();

  return Napi::String::New(env, str.buf, str.len);
}

Napi::Value RunningInContainer(const Napi::CallbackInfo &info) {
  bool running_in_container = !!appsignal_running_in_container();

  return Napi::Value::From(info.Env(), running_in_container);
}

// Data Array encoding

Napi::Value CreateDataArray(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  appsignal_data_t *data_ptr = appsignal_data_array_new();

  return Napi::External<appsignal_data_t>::New(
      env, data_ptr,
      [](Napi::Env env, appsignal_data_t *ptr) { appsignal_free_data(ptr); });
}

Napi::Value AppendStringToDataArray(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String value = info[0].As<Napi::String>();
  const std::string value_utf8 = value.Utf8Value();

  Napi::External<appsignal_data_t> arr =
      info[1].As<Napi::External<appsignal_data_t>>();

  appsignal_data_array_append_string(arr.Data(),
                                     MakeAppsignalString(value_utf8));

  return env.Null();
}

Napi::Value AppendIntToDataArray(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::Number num = info[0].As<Napi::Number>();

  Napi::External<appsignal_data_t> arr =
      info[1].As<Napi::External<appsignal_data_t>>();

  appsignal_data_array_append_integer(arr.Data(), (long)num.DoubleValue());

  return env.Null();
}

Napi::Value AppendFloatToDataArray(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::Number num = info[0].As<Napi::Number>();

  Napi::External<appsignal_data_t> arr =
      info[1].As<Napi::External<appsignal_data_t>>();

  appsignal_data_array_append_float(arr.Data(), num.DoubleValue());

  return env.Null();
}

Napi::Value AppendBooleanToDataArray(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::Boolean bl = info[0].As<Napi::Boolean>();

  Napi::External<appsignal_data_t> arr =
      info[1].As<Napi::External<appsignal_data_t>>();

  appsignal_data_array_append_boolean(arr.Data(), (int)bl);

  return env.Null();
}

Napi::Value AppendNullToDataArray(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::External<appsignal_data_t> arr =
      info[0].As<Napi::External<appsignal_data_t>>();

  appsignal_data_array_append_null(arr.Data());

  return env.Null();
}

Napi::Value AppendDataToDataArray(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::External<appsignal_data_t> data =
      info[0].As<Napi::External<appsignal_data_t>>();

  Napi::External<appsignal_data_t> arr =
      info[1].As<Napi::External<appsignal_data_t>>();

  appsignal_data_array_append_data(arr.Data(), data.Data());

  return env.Null();
}

// Data Map encoding

Napi::Value CreateDataMap(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  appsignal_data_t *data_ptr = appsignal_data_map_new();

  return Napi::External<appsignal_data_t>::New(
      env, data_ptr,
      [](Napi::Env env, appsignal_data_t *ptr) { appsignal_free_data(ptr); });
}

Napi::Value SetStringToDataMap(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();
  Napi::String value = info[1].As<Napi::String>();
  const std::string value_utf8 = value.Utf8Value();

  Napi::External<appsignal_data_t> map =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_data_map_set_string(map.Data(), MakeAppsignalString(key_utf8),
                                MakeAppsignalString(value_utf8));

  return env.Null();
}

Napi::Value SetIntToDataMap(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();
  Napi::Number num = info[1].As<Napi::Number>();

  Napi::External<appsignal_data_t> map =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_data_map_set_integer(map.Data(), MakeAppsignalString(key_utf8),
                                 (long)num.DoubleValue());

  return env.Null();
}

Napi::Value SetFloatToDataMap(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();
  Napi::Number num = info[1].As<Napi::Number>();

  Napi::External<appsignal_data_t> map =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_data_map_set_float(map.Data(), MakeAppsignalString(key_utf8),
                               num.DoubleValue());

  return env.Null();
}

Napi::Value SetBooleanToDataMap(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();
  Napi::Boolean bl = info[1].As<Napi::Boolean>();

  Napi::External<appsignal_data_t> map =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_data_map_set_boolean(map.Data(), MakeAppsignalString(key_utf8),
                                 (int)bl);

  return env.Null();
}

Napi::Value SetNullToDataMap(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();

  Napi::External<appsignal_data_t> map =
      info[1].As<Napi::External<appsignal_data_t>>();

  appsignal_data_map_set_null(map.Data(), MakeAppsignalString(key_utf8));

  return env.Null();
}

Napi::Value SetDataToDataMap(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();

  Napi::External<appsignal_data_t> data =
      info[1].As<Napi::External<appsignal_data_t>>();

  Napi::External<appsignal_data_t> map =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_data_map_set_data(map.Data(), MakeAppsignalString(key_utf8), data.Data());

  return env.Null();
}

// Json representation for debugging purposes

Napi::Value GetDataToJson(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::External<appsignal_data_t> data =
      info[0].As<Napi::External<appsignal_data_t>>();

  appsignal_string_t str = appsignal_data_to_json(data.Data());

  return Napi::String::New(env, str.buf, str.len);
}

// LOGGING API

Napi::Value Log(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String group = info[0].As<Napi::String>();
  Napi::Number severity = info[1].As<Napi::Number>();
  Napi::String message = info[2].As<Napi::String>();
  Napi::External<appsignal_data_t> attributes =
    info[3].As<Napi::External<appsignal_data_t>>();

  appsignal_log(
    MakeAppsignalString(group),
    severity.Int32Value(),
    MakeAppsignalString(message),
    attributes.Data()
  );

  return env.Null();
}

// SPAN API

Napi::Value CreateOpenTelemetrySpan(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  // Span and trace ids
  Napi::String spanId = info[0].As<Napi::String>();
  Napi::String parentSpanId = info[1].As<Napi::String>();
  Napi::String traceId = info[2].As<Napi::String>();

  // Timestamps
  Napi::Number startTimeSec = info[3].As<Napi::Number>();
  Napi::Number startTimeNsec = info[4].As<Napi::Number>();
  Napi::Number endTimeSec = info[5].As<Napi::Number>();
  Napi::Number endTimeNsec = info[6].As<Napi::Number>();

  // Name and attributes
  Napi::String name = info[7].As<Napi::String>();
  Napi::External<appsignal_data_t> attributes =
      info[8].As<Napi::External<appsignal_data_t>>();

  // Name and attributes
  Napi::String instrumentationLibraryName = info[9].As<Napi::String>();

  // Create this data as a span
  appsignal_span_t *span_ptr = appsignal_create_opentelemetry_span(
      MakeAppsignalString(spanId),
      MakeAppsignalString(parentSpanId),
      MakeAppsignalString(traceId),
      startTimeSec.Int64Value(),
      startTimeNsec.Int32Value(),
      endTimeSec.Int64Value(),
      endTimeNsec.Int32Value(),
      MakeAppsignalString(name),
      attributes.Data(),
      MakeAppsignalString(instrumentationLibraryName)
  );

  return Napi::External<appsignal_span_t>::New(
      env, span_ptr,
      [](Napi::Env env, appsignal_span_t *ptr) { appsignal_free_span(ptr); });
}

Napi::Value SpanToJSON(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::External<appsignal_span_t> span =
      info[0].As<Napi::External<appsignal_span_t>>();

  appsignal_string_t str = appsignal_span_to_json(span.Data());

  return Napi::String::New(env, str.buf, str.len);
}

Napi::Value AddSpanError(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::External<appsignal_span_t> span =
      info[0].As<Napi::External<appsignal_span_t>>();

  Napi::String name = info[1].As<Napi::String>();
  const std::string name_utf8 = name.Utf8Value();
  Napi::String msg = info[2].As<Napi::String>();
  const std::string msg_utf8 = msg.Utf8Value();

  Napi::External<appsignal_data_t> backtrace =
      info[3].As<Napi::External<appsignal_data_t>>();

  appsignal_add_span_error(span.Data(), MakeAppsignalString(name_utf8),
                           MakeAppsignalString(msg_utf8), backtrace.Data());

  return env.Null();
}

Napi::Value CloseSpan(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::External<appsignal_span_t> span =
      info[0].As<Napi::External<appsignal_span_t>>();

  appsignal_close_span(span.Data());

  return env.Null();
}

// Metrics

Napi::Value SetGauge(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();

  Napi::Number value = info[1].As<Napi::Number>();

  Napi::External<appsignal_data_t> payload =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_set_gauge(MakeAppsignalString(key_utf8), value.DoubleValue(),
                      payload.Data());

  return env.Null();
}

Napi::Value IncrementCounter(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();

  Napi::Number value = info[1].As<Napi::Number>();

  Napi::External<appsignal_data_t> payload =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_increment_counter(MakeAppsignalString(key_utf8),
                              value.DoubleValue(), payload.Data());

  return env.Null();
}

Napi::Value AddDistributionValue(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::String key = info[0].As<Napi::String>();
  const std::string key_utf8 = key.Utf8Value();

  Napi::Number value = info[1].As<Napi::Number>();

  Napi::External<appsignal_data_t> payload =
      info[2].As<Napi::External<appsignal_data_t>>();

  appsignal_add_distribution_value(MakeAppsignalString(key_utf8),
                                   value.DoubleValue(), payload.Data());

  return env.Null();
}

// Expose JavaScript objects

Napi::Object CreateDataArrayObject(Napi::Env env, Napi::Object exports) {
  Napi::Object dataarray = Napi::Object::New(env);

  dataarray.Set(Napi::String::New(env, "create"),
                Napi::Function::New(env, CreateDataArray));
  dataarray.Set(Napi::String::New(env, "appendString"),
                Napi::Function::New(env, AppendStringToDataArray));
  dataarray.Set(Napi::String::New(env, "appendInteger"),
                Napi::Function::New(env, AppendIntToDataArray));
  dataarray.Set(Napi::String::New(env, "appendFloat"),
                Napi::Function::New(env, AppendFloatToDataArray));
  dataarray.Set(Napi::String::New(env, "appendBoolean"),
                Napi::Function::New(env, AppendBooleanToDataArray));
  dataarray.Set(Napi::String::New(env, "appendNull"),
                Napi::Function::New(env, AppendNullToDataArray));
  dataarray.Set(Napi::String::New(env, "appendData"),
                Napi::Function::New(env, AppendDataToDataArray));
  dataarray.Set(Napi::String::New(env, "toJson"),
                Napi::Function::New(env, GetDataToJson));

  return dataarray;
}

Napi::Object CreateDataMapObject(Napi::Env env, Napi::Object exports) {
  Napi::Object datamap = Napi::Object::New(env);

  datamap.Set(Napi::String::New(env, "create"),
              Napi::Function::New(env, CreateDataMap));
  datamap.Set(Napi::String::New(env, "setString"),
              Napi::Function::New(env, SetStringToDataMap));
  datamap.Set(Napi::String::New(env, "setInteger"),
              Napi::Function::New(env, SetIntToDataMap));
  datamap.Set(Napi::String::New(env, "setFloat"),
              Napi::Function::New(env, SetFloatToDataMap));
  datamap.Set(Napi::String::New(env, "setBoolean"),
              Napi::Function::New(env, SetBooleanToDataMap));
  datamap.Set(Napi::String::New(env, "setNull"),
              Napi::Function::New(env, SetNullToDataMap));
  datamap.Set(Napi::String::New(env, "setData"),
              Napi::Function::New(env, SetDataToDataMap));
  datamap.Set(Napi::String::New(env, "toJson"),
              Napi::Function::New(env, GetDataToJson));

  return datamap;
}

Napi::Object CreateExtensionObject(Napi::Env env, Napi::Object exports) {
  Napi::Object extension = Napi::Object::New(env);

  extension.Set(Napi::String::New(env, "start"),
                Napi::Function::New(env, Start));
  extension.Set(Napi::String::New(env, "stop"), Napi::Function::New(env, Stop));
  extension.Set(Napi::String::New(env, "diagnoseRaw"),
                Napi::Function::New(env, DiagnoseRaw));
  extension.Set(Napi::String::New(env, "runningInContainer"),
                Napi::Function::New(env, RunningInContainer));
  extension.Set(Napi::String::New(env, "createOpenTelemetrySpan"),
                Napi::Function::New(env, CreateOpenTelemetrySpan));
  extension.Set(Napi::String::New(env, "log"), Napi::Function::New(env, Log));

  return extension;
}

Napi::Object CreateMetricsObject(Napi::Env env, Napi::Object exports) {
  Napi::Object metrics = Napi::Object::New(env);

  metrics.Set(Napi::String::New(env, "setGauge"),
              Napi::Function::New(env, SetGauge));
  metrics.Set(Napi::String::New(env, "incrementCounter"),
              Napi::Function::New(env, IncrementCounter));
  metrics.Set(Napi::String::New(env, "addDistributionValue"),
              Napi::Function::New(env, AddDistributionValue));

  return metrics;
}

Napi::Object CreateSpanObject(Napi::Env env, Napi::Object exports) {
  Napi::Object span = Napi::Object::New(env);

  span.Set(Napi::String::New(env, "closeSpan"),
           Napi::Function::New(env, CloseSpan));
  span.Set(Napi::String::New(env, "addSpanError"),
           Napi::Function::New(env, AddSpanError));
  span.Set(Napi::String::New(env, "spanToJSON"),
           Napi::Function::New(env, SpanToJSON));

  return span;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "extension"),
              CreateExtensionObject(env, exports));
  exports.Set(Napi::String::New(env, "span"), CreateSpanObject(env, exports));
  exports.Set(Napi::String::New(env, "datamap"),
              CreateDataMapObject(env, exports));
  exports.Set(Napi::String::New(env, "dataarray"),
              CreateDataArrayObject(env, exports));
  exports.Set(Napi::String::New(env, "metrics"),
              CreateMetricsObject(env, exports));
  return exports;
}

NODE_API_MODULE(addon, Init)
