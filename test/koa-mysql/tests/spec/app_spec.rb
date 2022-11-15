# frozen_string_literal: true

RSpec.describe "Koa + MySQL app" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe "GET /get" do
    it "creates Koa router child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/get")
      expect(response.status).to eq(200)

      expect(Span.root!).to be_http_span_with_route("GET /get")
      expect("/get").to have_koa_router_span
    end
  end

  describe "GET /get with params" do
    it "adds params to the router child span" do
      response = HTTP.get("#{@test_app_url}/get?param1=user&param2=password")
      expect(response.status).to eq(200)

      router_span = Span.find_by_name!("router - /get")

      expected_request_parameters = {
        "param1" => "user",
        "param2" => "password"
      }

      expect(router_span).to match_request_parameters(expected_request_parameters)
    end
  end

  describe "GET /error" do
    it "adds an error event in the Koa router span" do
      response = HTTP.get("#{@test_app_url}/error")
      expect(response.status).to eq(500)

      expect(Span.root!).to be_http_span_with_route("GET /error")
      expect("/error").to have_koa_router_span
      router_span = Span.find_by_name!("router - /error")
      expect(router_span).to have_error_event("Expected test error!")
    end
  end

  describe "GET /mysql-query" do
    it "creates a MySQL child span on the Koa router span" do
      response = HTTP.get("#{@test_app_url}/mysql-query")
      expect(Span.root!).to be_http_span_with_route("GET /mysql-query")
      expect("/mysql-query").to have_koa_router_span
      expect(response.status).to eq(200)

      parent_span = Span.find_by_name!("router - /mysql-query")
      sql_span = parent_span.sql_child_by_library_and_type(
        :library => "@opentelemetry/instrumentation-mysql",
        :type => "SELECT"
      )

      expect(sql_span.attributes["db.statement"]).to eq("SELECT 1 + 1 AS solution")
    end
  end

  describe "GET /mysql2-query" do
    it "creates a MySQL2 child span on the Koa router span" do
      response = HTTP.get("#{@test_app_url}/mysql2-query")
      expect(Span.root!).to be_http_span_with_route("GET /mysql2-query")
      expect(response.status).to eq(200)
      expect("/mysql2-query").to have_koa_router_span

      parent_span = Span.find_by_name!("router - /mysql2-query")
      sql_span = parent_span.sql_child_by_library_and_type(
        :library => "@opentelemetry/instrumentation-mysql2",
        :type => "SELECT"
      )

      expect(sql_span.attributes["db.statement"]).to eq("SELECT 1 + 1 AS solution")
    end
  end
end
