# frozen_string_literal: true

require "http"

RSpec.describe "Express Apollo app" do
  before(:all) do
    @test_app_url = URI(ENV.fetch("TEST_APP_URL"))
  end

  describe("POST /graphql querying for all books and authors") do
    it "creates two GraphQL spans, one for the resolver and another one for the query" do
      graphql_query = "{ books { title author } }"
      response = HTTP.post("#{@test_app_url}/graphql", :json => { :query => graphql_query })

      expect(response.code.to_i).to eq(200)
      expect_graphql_spans(graphql_query)
    end
  end
end
