# frozen_string_literal: true

require "rspec/expectations"

RSpec::Matchers.define :have_redis_4_span do
  match do |actual|
    redis_span = redis_command_span_by_statement(actual)
    command = actual.split.first

    redis_span.name == "redis-#{command}" &&
      redis_span.instrumentation_library_name == "@opentelemetry/instrumentation-redis-4"
  end
end

RSpec::Matchers.define :have_ioredis_span do
  match do |actual|
    redis_span = redis_command_span_by_statement(actual)
    command = actual.split.first

    redis_span.name == command &&
      redis_span.instrumentation_library_name == "@opentelemetry/instrumentation-ioredis"
  end
end

def redis_command_span_by_statement(statement)
  redis_span = Span.all.find do |span|
    next unless span.attributes["db.system"] == "redis"

    span.attributes["db.statement"] == statement
  end
  raise "No Redis span with statement `#{statement}` found" unless redis_span

  redis_span
end
