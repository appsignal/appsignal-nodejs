# frozen_string_literal: true

RSpec.describe "Redis app" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe "GET / with params" do
    it "adds params to the HTTP root span" do
      response = HTTP.get("#{@test_app_url}?param1=user&param2=password")
      expect(response.status).to eq(200)
      expect(Span.root!).to be_http_span_with_route("GET /")

      expected_request_parameters = {
        "param1" => "user",
        "param2" => "password"
      }

      expect(Span.root!).to match_request_parameters(expected_request_parameters)
    end
  end

  describe "GET / with session data" do
    it "adds session data to the HTTP root span" do
      response = HTTP.cookies(:cookie => "chocolate").get(@test_app_url)
      expect(response.status).to eq(200)
      expect(Span.root!).to be_http_span_with_route("GET /")

      expected_session_data_parameters = {
        "cookie" => "chocolate"
      }
      expect(Span.root!).to match_request_session_data(expected_session_data_parameters)
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

  describe "GET /error" do
    it "adds an error event on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/error")
      expect(response.status).to eq(500)

      expect(Span.root!).to be_http_span_with_route("GET /error")
      expect(Span.root!).to have_error_event("Expected test error!")
    end
  end

  describe "GET /custom" do
    it "uses custom instrumentation and magic attribute helpers" do
      response = HTTP.get("#{@test_app_url}/custom")
      expect(response.status).to eq(200)

      expect(Span.root!).to match_custom_data({ "custom" => "data" })

      custom_span = Span.find_by_name!("Custom span")
      expect(custom_span.parent.id).to eql(Span.root.id)
      expect(custom_span.attributes["appsignal.tag.custom"]).to eql("tag")
    end
  end

  describe "GET /filesystem" do
    it "creates an fs child span" do
      response = HTTP.get("#{@test_app_url}/filesystem")
      expect(response.status).to eq(200)

      expect(Span.root!).to be_http_span_with_route("GET /filesystem")

      fs_span = Span.find_by_name!("fs access")
      expect(fs_span.parent.id).to eql(Span.root.id)
      expect(fs_span.instrumentation_library_name).to eql("@opentelemetry/instrumentation-fs")
    end
  end
end
