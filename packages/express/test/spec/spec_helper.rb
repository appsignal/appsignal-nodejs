# frozen_string_literal: true

require_relative "../../../../test/integration/support"

RSpec.configure do |config|
  config.include IntegrationHelper

  config.example_status_persistence_file_path = "spec/examples.txt"
  config.fail_if_no_examples = true
  config.mock_with :rspec do |mocks|
    mocks.syntax = :expect
  end
  config.expect_with :rspec do |expectations|
    expectations.syntax = :expect
  end
end
