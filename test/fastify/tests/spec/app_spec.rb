# frozen_string_literal: true

require "http"

RSpec.describe "Fastify app" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe("GET /") do
    it "creates a Fastify request handler child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/")
      expect(response.status).to eq(200)
      expect(Span.root!).to be_http_span_with_route("GET /")

      # Fails if not found
      Span.find_by_name!("request handler - anonymous")
    end
  end

  describe("GET /error") do
    it "creates a Fastify request handler child span with an error event" do
      response = HTTP.get("#{@test_app_url}/error")
      expect(response.status).to eq(500)
      expect(Span.root!).to be_http_span_with_route("GET /error")

      request_handler_span = Span.find_by_name!("request handler - anonymous")
      expect(request_handler_span).to have_error_event("EXPECTED ERROR!")
    end
  end
end
