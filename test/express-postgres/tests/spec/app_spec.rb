# frozen_string_literal: true

RSpec.describe "Postgres app" do
  before(:all) do
    @test_app_url = ENV.fetch("TEST_APP_URL")
  end

  describe("GET /pg-query") do
    it "creates a PSQL child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/pg-query")
      expect(Span.root!).to be_http_span_with_route("GET /pg-query")
      expect("/pg-query").to have_express_request_handler
      expect(response.status).to eq(200)
      # Found if it doesn't fail
      sql_span_by_parent_library_and_type(
        :parent_span_name => "GET /pg-query",
        :library => "@opentelemetry/instrumentation-pg",
        :type => "pg-pool.connect"
      )

      sql_query_span = sql_span_by_parent_library_and_type(
        :parent_span_name => "GET /pg-query",
        :library => "@opentelemetry/instrumentation-pg",
        :type => "pg.query:SELECT"
      )

      expect(
        sql_query_span.attributes["db.statement"]
      ).to eq("SELECT 1 + 1 AS solution")
    end
  end
end
