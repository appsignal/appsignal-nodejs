# frozen_string_literal: true

require "rspec/expectations"
require "json"

RSpec::Matchers.define :match_request_parameters do |expected|
  match do |actual|
    parsed_params = JSON[actual.attributes["appsignal.request.parameters"]]

    parsed_params == expected
  end
end

RSpec::Matchers.define :match_request_session_data do |expected|
  match do |actual|
    parsed_session_data = JSON[actual.attributes["appsignal.request.session_data"]]

    parsed_session_data == expected
  end
end

RSpec::Matchers.define :match_custom_data do |expected|
  match do |actual|
    parsed_custom_data = JSON[actual.attributes["appsignal.custom_data"]]

    parsed_custom_data == expected
  end
end
