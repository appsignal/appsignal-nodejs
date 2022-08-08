# frozen_string_literal: true

module IntegrationHelper
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

  def expect_http_root_span(name)
    root_span!

    expect(root_span["name"]).to eq(name)
    expect(root_span["instrumentationLibrary"]["name"])
      .to eq("@opentelemetry/instrumentation-http")
  end

  def expect_express_request_handler_span(endpoint)
    request_handler_span = spans.find do |span|
      span["attributes"]["express.type"] == "request_handler"
    end
    raise "No Express request handler span found" unless request_handler_span

    expect(child_span_of?(root_span, request_handler_span)).to be true

    expect(request_handler_span["name"])
      .to eq("request handler - #{endpoint}")
    expect(request_handler_span["instrumentationLibrary"]["name"])
      .to eq("@opentelemetry/instrumentation-express")
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
    expect(redis_span["instrumentationLibrary"]["name"])
      .to eq("@opentelemetry/instrumentation-redis-4")
  end

  def expect_ioredis_span(statement)
    redis_span = expect_redis_command_span(statement)
    command = statement.split.first

    expect(redis_span["name"]).to eq(command)
    expect(redis_span["instrumentationLibrary"]["name"])
      .to eq("@opentelemetry/instrumentation-ioredis")
  end
end
