# frozen_string_literal: true

module IntegrationHelper
  def fetch_root_span_id(log)
    span_id = /Start root span '(\w+)' in '\w+'/.match(log).captures.last
    raise "Span ID was empty for root span.\n#{log}" if span_id.strip.empty?

    span_id
  end

  def fetch_child_span_ids(log, root_span_id)
    log.scan(/Start child span '(\w+)' with parent '#{root_span_id}'/).map(&:first)
  end
end
