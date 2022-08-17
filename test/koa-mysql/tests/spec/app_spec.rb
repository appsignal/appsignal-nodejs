# frozen_string_literal: true

RSpec.describe "Koa + MySQL app" do
  before(:all) do
    @test_app_url = ENV.fetch("TEST_APP_URL")
  end

  describe "GET /get" do
    it "creates Koa router child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/get")
      expect(response.status).to eq(200)

      expect_http_root_span("GET /get")
      expect_koa_router_span("/get")
    end
  end

  describe "GET /error" do
    it "adds an error event in the Koa router span" do
      response = HTTP.get("#{@test_app_url}/error")
      expect(response.status).to eq(500)

      expect_http_root_span("GET /error")
      expect_koa_router_span("/error")
      expect_error_in_span(
        :span_name => "router - /error",
        :error_message => "Expected test error!"
      )
    end
  end

  describe "GET /mysql-query" do
    it "creates a MySQL child span on the Koa router span" do
      response = HTTP.get("#{@test_app_url}/mysql-query")
      expect(response.status).to eq(200)
      sql_span = sql_span_by_parent_and_library(
        :parent_span_name => "router - /mysql-query",
        :library => "@opentelemetry/instrumentation-mysql"
      )

      expect(sql_span["attributes"]["db.statement"]).to eq("SELECT 1 + 1 AS solution")
    end
  end

  describe "GET /mysql2-query" do
    it "creates a MySQL2 child span on the Koa router span" do
      response = HTTP.get("#{@test_app_url}/mysql2-query")
      expect(response.status).to eq(200)
      sql_span = sql_span_by_parent_and_library(
        :parent_span_name => "router - /mysql2-query",
        :library => "@opentelemetry/instrumentation-mysql2"
      )

      expect(sql_span["attributes"]["db.statement"]).to eq("SELECT 1 + 1 AS solution")
    end
  end
end
