# frozen_string_literal: true

require "http"

RSpec.describe "Express Yoga app" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe("POST /graphql querying for all books and authors") do
    it "creates two GraphQL spans, one for the resolver and another one for the query" do
      graphql_query = "{ books { title author } }"
      response = HTTP.post("#{@test_app_url}/graphql", :json => { :query => graphql_query })

      expect(Span.root!).to be_http_span_with_route("HTTP POST")
      expect(response.code.to_i).to eq(200)
      expect(graphql_query).to have_graphql_span
    end
  end
end
