# frozen_string_literal: true

require "rspec/expectations"

RSpec::Matchers.define :have_express_request_handler do
  match do |actual|
    request_handler_span = Span.find_by_attribute("express.type", "request_handler")

    Span.root.transitive_parent_of?(request_handler_span) &&
      request_handler_span.name == ("request handler - #{actual}") &&
      request_handler_span.instrumentation_library_name == "@opentelemetry/instrumentation-express"
  end

  failure_message do
    "No Express request handler span found"
  end
end
