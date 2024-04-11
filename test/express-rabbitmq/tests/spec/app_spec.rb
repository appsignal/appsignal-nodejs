# frozen_string_literal: true

RSpec.describe "RabbitMQ app" do
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

  describe "GET route with route params" do
    it "adds params to the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/route-param/123456")
      expect(response.status).to eq(200)
      expect(Span.root!).to be_http_span_with_route("GET /route-param/:id")

      expected_request_parameters = { "id" => "123456" }

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

  describe "GET /rabbitmq" do
    it "creates a rabbitmq child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/rabbitmq")
      expect(response.status).to eq(200)
      expect(Span.root!).to be_http_span_with_route("GET /rabbitmq")
      expect("/rabbitmq").to have_express_request_handler

      expect("<default> -> queue send").to have_rabbitmq_span
      expect("queue process").to have_rabbitmq_span
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
end
