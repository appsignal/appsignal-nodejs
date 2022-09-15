# frozen_string_literal: true

require "rspec/expectations"
require "json"

RSpec::Matchers.define :be_http_span_with_route do |expected|
  match do |actual|
    actual.name == expected &&
      actual.instrumentation_library_name == "@opentelemetry/instrumentation-http"
  end
end

RSpec::Matchers.define :match_request_parameters do |expected|
  match do |actual|
    parsed_params = JSON[actual.attributes["appsignal.request.parameters"]]

    parsed_params == expected
  end
end
