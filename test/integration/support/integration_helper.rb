# frozen_string_literal: true

module IntegrationHelper
  def fetch_root_span_id(log)
    span_id = /Start root span '(\w+)' in '\w+'/.match(log).captures.last
    raise "Span ID was empty for root span.\n#{log}" if span_id.strip.empty?

    span_id
  end
end
