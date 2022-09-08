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

  def expect_redis_command_span(statement)
    redis_span = Span.all.find do |span|
      next unless span.attributes["db.system"] == "redis"

      span.attributes["db.statement"] == statement
    end
    raise "No Redis span with statement `#{statement}` found" unless redis_span

    expect(Span.root.transitive_parent_of?(redis_span)).to be true

    redis_span
  end

  def expect_redis_4_span(statement)
    redis_span = expect_redis_command_span(statement)
    command = statement.split.first

    expect(redis_span.name).to eq("redis-#{command}")
    expect(redis_span.instrumentation_library_name).to eq(
      "@opentelemetry/instrumentation-redis-4"
    )
  end

  def expect_ioredis_span(statement)
    redis_span = expect_redis_command_span(statement)
    command = statement.split.first

    expect(redis_span.name).to eq(command)
    expect(redis_span.instrumentation_library_name).to eq(
      "@opentelemetry/instrumentation-ioredis"
    )
  end

  def expect_koa_router_span(path)
    router_span = Span.find_by_attribute("koa.type", "router")
    raise "No Koa router span found" unless router_span

    expect(Span.root.transitive_parent_of?(router_span)).to be true

    expect(router_span.name).to eq("router - #{path}")
    expect(
      router_span.instrumentation_library_name
    ).to eq("@opentelemetry/instrumentation-koa")
  end

  def expect_error_in_span(span_name:, error_message:)
    span = Span.all.find do |error_span|
      error_span.name == span_name
    end
    raise "No span with name #{span_name} found" unless span

    error_event = span.events.find do |event|
      event["name"] == "exception" && event["attributes"]["exception.message"] == error_message
    end
    raise "No error span found for message: '#{error_message}'" unless error_event
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
