# frozen_string_literal: true

RSpec::Matchers.define :have_koa_router_span do
  match do |actual|
    router_span = Span.find_by_attribute("koa.type", "router")
    raise "No Koa router span found" unless router_span

    Span.root.transitive_parent_of?(router_span) &&
      router_span.name == "router - #{actual}" &&
      router_span.instrumentation_library_name == "@opentelemetry/instrumentation-koa"
  end
end
