# frozen_string_literal: true

RSpec::Matchers.define :have_graphql_span do
  match do |actual|
    Span.all.any? do |span|
      span.name == "graphql.parse" && span.attributes["graphql.source"] == actual
    end
  end
end
