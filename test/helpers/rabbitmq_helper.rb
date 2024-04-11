# frozen_string_literal: true

require "rspec/expectations"

RSpec::Matchers.define :have_rabbitmq_span do
  match do |actual|
    rabbitmq_span = Span.all.find do |span|
      span.name == actual
    end

    raise "No RabbitMQ span with name `#{name}` found" unless rabbitmq_span

    rabbitmq_span.instrumentation_library_name == "@opentelemetry/instrumentation-amqplib"
  end
end
