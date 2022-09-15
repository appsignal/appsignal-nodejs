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
      parent_span = Span.find_by_name!("GET /pg-query")
      # Found if it doesn't fail
      parent_span.sql_child_by_library_and_type(
        :library => "@opentelemetry/instrumentation-pg",
        :type => "pg-pool.connect"
      )

      sql_query_span = parent_span.sql_child_by_library_and_type(
        :library => "@opentelemetry/instrumentation-pg",
        :type => "pg.query:SELECT"
      )

      expect(
        sql_query_span.attributes["db.statement"]
      ).to eq("SELECT 1 + 1 AS solution")
    end
  end
end
