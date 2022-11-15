# frozen_string_literal: true

require_relative "./config_helper"

module IntegrationHelper
  def self.wait_for_start
    max_retries = 1200
    retries = 0

    begin
      HTTP.timeout(1).get("#{ConfigHelper.test_app_url}/")
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

  def self.clean_spans
    Span.clear_all
  end

  def self.print_spans
    puts Span.all.inspect
  end
end
