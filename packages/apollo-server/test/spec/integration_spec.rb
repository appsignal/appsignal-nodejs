# frozen_string_literal: true

require "net/http"
require "json"

EXAMPLE_APP_DIR = File.expand_path(File.join("..", "example"), __dir__)

RSpec.describe "Apollo Server" do
  before(:context) do
    @app = AppRunner.new("npm run start", EXAMPLE_APP_DIR)
    @app.run
    @app.wait_for_start!("Server ready at")
  end
  after(:context) { @app.stop }
  after { @app.cleanup }

  def request_query(query)
    uri = URI("http://localhost:4010/")
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Post.new(uri.request_uri)
    request["Content-Type"] = "application/json"
    request.body = { "query" => query }.to_json
    http.request(request)
  end

  it("reports a successful query") do
    query = "query AllTheBooks { books { title } }"
    response = request_query(query)
    expect(response.code).to eq("200")

    log = @app.logs

    root_span_id = fetch_root_span_id(log)
    expect(log).to include("Set name 'AllTheBooks' for span '#{root_span_id}'")

    child_span_ids = fetch_child_span_ids(log, root_span_id)
    expect(child_span_ids.length).to be(3)

    parse_span_id, validate_span_id, execute_span_id = child_span_ids

    expect(log).to include(
      "Set attribute for key 'appsignal:category' " \
        "with value 'parse.graphql' to span '#{parse_span_id}'"
    )
    expect(log).to include(
      "Set attribute for key 'appsignal:category' " \
        "with value 'validate.graphql' to span '#{validate_span_id}'"
    )
    expect(log).to include(
      "Set attribute for key 'appsignal:category' " \
        "with value 'execute.graphql' to span '#{execute_span_id}'"
    )
    expect(log).to include(
      "Set attribute for key 'appsignal:body' " \
        "with value '#{query}' to span '#{execute_span_id}'"
    )
  end

  it("reports an error when a query fails to parse") do
    query = "gibberish"
    response = request_query(query)
    expect(response.code).to eq("400")

    log = @app.logs

    root_span_id = fetch_root_span_id(log)
    expect(log).to include("Set name '[unknown graphql query]' for span '#{root_span_id}'")

    expect(log).to include(
      "Add error 'GraphQLError' to span '#{root_span_id}' with message " \
        "'Syntax Error: Unexpected Name \"gibberish\".' with a backtrace"
    )

    child_span_ids = fetch_child_span_ids(log, root_span_id)
    expect(child_span_ids.length).to be(1)

    parse_span_id = child_span_ids.first

    expect(log).to include(
      "Set attribute for key 'appsignal:category' " \
        "with value 'parse.graphql' to span '#{parse_span_id}'"
    )

    expect(log).not_to include(
      "Set attribute for key 'appsignal:category' with value 'validate.graphql'"
    )
    expect(log).not_to include(
      "Set attribute for key 'appsignal:category' with value 'execute.graphql'"
    )
  end

  it("reports an error when a query fails to validate") do
    query = "query { books { cover } }"
    response = request_query(query)
    expect(response.code).to eq("400")

    log = @app.logs

    root_span_id = fetch_root_span_id(log)
    expect(log).to include("Set name '[unknown graphql query]' for span '#{root_span_id}'")

    expect(log).to include(
      "Add error 'GraphQLError' to span '#{root_span_id}' with message " \
        "'Cannot query field \"cover\" on type \"Book\".' with a backtrace"
    )

    child_span_ids = fetch_child_span_ids(log, root_span_id)
    expect(child_span_ids.length).to be(2)

    parse_span_id, validate_span_id = child_span_ids

    expect(log).to include(
      "Set attribute for key 'appsignal:category' " \
        "with value 'parse.graphql' to span '#{parse_span_id}'"
    )
    expect(log).to include(
      "Set attribute for key 'appsignal:category' " \
        "with value 'validate.graphql' to span '#{validate_span_id}'"
    )

    expect(log).not_to include(
      "Set attribute for key 'appsignal:category' with value 'execute.graphql'"
    )
  end
end
