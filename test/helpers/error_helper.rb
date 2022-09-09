# frozen_string_literal: true

RSpec::Matchers.define :have_error_event do |expected|
  match do |actual|
    actual.events.any? do |event|
      event["name"] == "exception" && event["attributes"]["exception.message"] == expected
    end
  end
end
