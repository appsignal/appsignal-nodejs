# frozen_string_literal: true

require "http"
require "json"
require "/helpers/integration_helper"

SPANS_FILE_PATH = ENV.fetch("SPANS_FILE_PATH")
TEST_APP_URL = ENV.fetch("TEST_APP_URL")

def wait_for_start
  max_retries = 1200
  retries = 0

  begin
    HTTP.timeout(1).get("#{TEST_APP_URL}/")
    puts "The app has started!"
  rescue HTTP::ConnectionError, HTTP::TimeoutError
    if retries >= max_retries
      puts "The app has not started after #{retries} retries. Exiting."
      exit! 1
    elsif (retries % 5).zero?
      puts "The app has not started yet. Retrying... (#{retries}/#{max_retries})"
    end

    sleep 1
    retries += 1
    retry
  end
  # Wait for spans that haven't been written yet
  sleep 1
end

def clean_spans
  File.open(SPANS_FILE_PATH, "w").close
end

RSpec.configure do |config|
  config.include IntegrationHelper

  config.before(:suite) do
    # Wait for the app to be alive before running the tests.
    wait_for_start
  end

  config.before(:each) do
    clean_spans
  end

  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
end
