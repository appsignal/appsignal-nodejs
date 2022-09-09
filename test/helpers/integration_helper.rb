# frozen_string_literal: true

module IntegrationHelper
  SPANS_FILE_PATH = ENV.fetch("SPANS_FILE_PATH")
  TEST_APP_URL = ENV.fetch("TEST_APP_URL")

  def self.wait_for_start
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

  def self.clean_spans
    Span.clear_all
  end

  def sql_span_by_parent_library_and_type(parent_span_name:, library:, type:)
    parent_span = Span.all.find do |span|
      span.name == parent_span_name
    end
    raise "No parent span with name `#{parent_span_name}` found" unless parent_span

    sql_span = Span.all.find do |span|
      span.parent_id == parent_span.id &&
        span.instrumentation_library_name == library &&
        span.name == type
    end
    unless sql_span
      raise(
        "No SQL span with parent `#{span.parent_id}` type: #{type} " \
          "and system `#{library}` found"
      )
    end

    sql_span
  end

  def expect_graphql_spans(query)
    query_span = Span.all.find do |span|
      span.name == "graphql.execute" && span.attributes["graphql.source"] == query
    end

    raise "Couldn't find GraphQL query span for query #{query}" unless query_span
  end
end
