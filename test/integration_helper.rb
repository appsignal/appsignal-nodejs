# frozen_string_literal: true

module IntegrationHelper # rubocop:disable Metrics/ModuleLength
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
    File.open(SPANS_FILE_PATH, "w").close
  end

  def spans
    # Wait for spans that haven't been written yet
    sleep 1
    File.readlines(SPANS_FILE_PATH).map do |line|
      JSON.parse(line)
    end
  end

  def root_spans
    spans.select do |span|
      span["parentSpanId"].nil?
    end
  end

  def root_span
    return if root_spans.length != 1

    root_spans.first
  end

  def root_span!
    raise "There is no root span" if root_spans.length.zero?
    raise "There is more than one root span" if root_spans.length > 1

    root_span
  end

  # Given a span ID, returns the span, or `nil` if the span does not exist.
  def span(id)
    spans.find do |span|
      span["spanId"] == id
    end
  end

  # Given a parent span, returns its child spans.
  def child_spans(parent)
    spans.select do |span|
      span["parentSpanId"] == parent["spanId"]
    end
  end

  # Given a child span, returns its parent span, or `nil` if a root span is
  # passed.
  def parent_span(child)
    span(child["parentSpanId"])
  end

  # Returns whether the child span is a transitive child of the parent span.
  def child_span_of?(parent, child)
    while child && child["parentSpanId"]
      return true if child["parentSpanId"] == parent["spanId"]

      child = span(child["parentSpanId"])
    end

    false
  end

  # Instrumentation specific helpers
  def expect_http_root_span(name)
    root_span!

    expect(root_span["name"]).to eq(name)
    expect(root_span["instrumentationLibrary"]["name"]).to eq("@opentelemetry/instrumentation-http")
  end

  def expect_express_request_handler_span(endpoint)
    request_handler_span = spans.find do |span|
      span["attributes"]["express.type"] == "request_handler"
    end
    raise "No Express request handler span found" unless request_handler_span

    expect(child_span_of?(root_span, request_handler_span)).to be true

    expect(request_handler_span["name"]).to eq("request handler - #{endpoint}")
    expect(request_handler_span["instrumentationLibrary"]["name"]).to eq(
      "@opentelemetry/instrumentation-express"
    )
  end

  def expect_redis_command_span(statement)
    redis_span = spans.find do |span|
      next unless span["attributes"]["db.system"] == "redis"

      span["attributes"]["db.statement"] == statement
    end
    raise "No Redis span with statement `#{statement}` found" unless redis_span

    expect(child_span_of?(root_span, redis_span)).to be true

    redis_span
  end

  def expect_redis_4_span(statement)
    redis_span = expect_redis_command_span(statement)
    command = statement.split.first

    expect(redis_span["name"]).to eq("redis-#{command}")
    expect(redis_span["instrumentationLibrary"]["name"]).to eq(
      "@opentelemetry/instrumentation-redis-4"
    )
  end

  def expect_ioredis_span(statement)
    redis_span = expect_redis_command_span(statement)
    command = statement.split.first

    expect(redis_span["name"]).to eq(command)
    expect(redis_span["instrumentationLibrary"]["name"]).to eq(
      "@opentelemetry/instrumentation-ioredis"
    )
  end

  def expect_koa_router_span(path)
    router_span = spans.find do |span|
      span["attributes"]["koa.type"] == "router"
    end
    raise "No Koa router span found" unless router_span

    expect(child_span_of?(root_span, router_span)).to be true

    expect(router_span["name"]).to eq("router - #{path}")
    expect(
      router_span["instrumentationLibrary"]["name"]
    ).to eq("@opentelemetry/instrumentation-koa")
  end

  def expect_error_in_span(span_name:, error_message:)
    span = spans.find do |error_span|
      error_span["name"] == span_name
    end
    raise "No span with name #{span_name} found" unless span

    error_event = span["events"].find do |event|
      event["name"] == "exception" && event["attributes"]["exception.message"] == error_message
    end
    raise "No error span found for message: '#{error_message}'" unless error_event
  end

  def sql_span_by_parent_and_library(parent_span_name:, library:)
    parent_span = spans.find do |span|
      span["name"] == parent_span_name
    end
    raise "No parent span with name `#{parent_span_name}` found" unless parent_span

    sql_span = spans.find do |span|
      span["parentSpanId"] == parent_span["spanId"] &&
        span["instrumentationLibrary"]["name"] == library
    end
    unless sql_span
      raise "No SQL span with parent `#{span["parentSpanId"]}` and system `#{library}` found"
    end

    sql_span
  end
end
