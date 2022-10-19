# frozen_string_literal: true

RSpec::Matchers.define :have_nest_context_span do
  match do |actual|
    context_span = Span.find_by_name!(actual)
    raise "No Nest.js request context span found with name: '#{actual}'" unless context_span

    Span.root.transitive_parent_of?(context_span) &&
      context_span.instrumentation_library_name == "@opentelemetry/instrumentation-nestjs-core"
  end
end

RSpec::Matchers.define :have_nest_handler_span do
  match do |actual|
    handler_span = Span.find_by_name!(actual)
    raise "No Nest.js handler span found with name: '#{actual}'" unless handler_span

    Span.root.transitive_parent_of?(handler_span) &&
      handler_span.instrumentation_library_name == "@opentelemetry/instrumentation-nestjs-core"
  end
end
