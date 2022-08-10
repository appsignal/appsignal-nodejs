# frozen_string_literal: true

RSpec.describe "Redis app" do
  describe "GET /ioredis" do
    it "creates an IORedis child span on the HTTP root span" do
      response = HTTP.get("#{TEST_APP_URL}/ioredis")
      expect(response.status).to eq(200)

      expect_http_root_span("GET /ioredis")
      expect_express_request_handler_span("/ioredis")
      expect_ioredis_span("connect")
      expect_ioredis_span("info")
      expect_ioredis_span("set ? ?")
      expect_ioredis_span("get ?")
    end
  end

  describe "GET /redis" do
    it "creates a Redis child span on the HTTP root span" do
      response = HTTP.get("#{TEST_APP_URL}/redis")
      expect(response.status).to eq(200)

      expect_http_root_span("GET /redis")
      expect_express_request_handler_span("/redis")
      expect_redis_4_span("SET ? ?")
      expect_redis_4_span("GET ?")
    end
  end
end
