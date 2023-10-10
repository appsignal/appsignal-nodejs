# frozen_string_literal: true

require "rspec/expectations"
require "json"

RSpec::Matchers.define(:be_http_span_with_route) do |expected, library = "@opentelemetry/instrumentation-http"| # rubocop:disable Layout/LineLength
  match do |actual|
    actual.name == expected &&
      actual.instrumentation_library_name == library
  end
end
