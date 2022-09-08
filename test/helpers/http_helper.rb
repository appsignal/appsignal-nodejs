# frozen_string_literal: true

require "rspec/expectations"

RSpec::Matchers.define :be_http_span_with_route do |expected|
  match do |actual|
    actual.name == expected &&
      actual.instrumentation_library_name == "@opentelemetry/instrumentation-http"
  end
end
