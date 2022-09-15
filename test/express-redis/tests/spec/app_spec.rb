# frozen_string_literal: true

RSpec.describe "Redis app" do
  before(:all) do
    @test_app_url = ENV.fetch("TEST_APP_URL")
  end

  describe "GET / with params" do
    it "adds params to the request handler span" do
      response = HTTP.get("#{@test_app_url}?param1=user&param2=password")
      expect(response.status).to eq(200)
      expect(Span.root!).to be_http_span_with_route("GET /")

      request_handler_span = Span.find_by_name!("request handler - /")
      expected_request_parameters = {
        "param1" => "user",
        "param2" => "password"
      }

      expect(request_handler_span).to match_request_parameters(expected_request_parameters)
    end
  end

  describe "GET /ioredis" do
    it "creates an IORedis child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/ioredis")
      expect(response.status).to eq(200)
      expect(Span.root!).to be_http_span_with_route("GET /ioredis")
      expect("/ioredis").to have_express_request_handler

      expect("connect").to have_ioredis_span
      expect("info").to have_ioredis_span
      expect("set ? ?").to have_ioredis_span
      expect("get ?").to have_ioredis_span
    end
  end

  describe "GET /redis" do
    it "creates a Redis child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/redis")
      expect(response.status).to eq(200)

      expect(Span.root!).to be_http_span_with_route("GET /redis")
      expect("/redis").to have_express_request_handler

      expect("SET ? ?").to have_redis_4_span
      expect("GET ?").to have_redis_4_span
    end
  end
end