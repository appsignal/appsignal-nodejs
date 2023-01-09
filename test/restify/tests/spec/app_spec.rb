# frozen_string_literal: true

require "http"

RSpec.describe "restify app" do
  let(:test_app_url) { ConfigHelper.test_app_url }

  describe "GET /" do
    it "creates restify spans" do
      response = HTTP.get("#{test_app_url}/")

      expect(Span.root!).to be_http_span_with_route("GET /")
      expect(response.code.to_i).to eq(200)

      span = Span.find_by_name!("request handler - /")
      expect(span.attributes).to include(
        "restify.type" => "request_handler",
        "restify.method" => "get",
        "http.route" => "/"
      )
    end
  end

  describe "GET /hello/:name" do
    it "creates restify spans" do
      response = HTTP.get("#{test_app_url}/hello/world?query=value")

      expect(Span.root!).to be_http_span_with_route("GET /hello/:name")
      expect(response.code.to_i).to eq(200)

      span = Span.find_by_name!("request handler - /hello/:name")
      expect(span.attributes).to include(
        "restify.type" => "request_handler",
        "restify.method" => "get",
        "http.route" => "/hello/:name",
        "appsignal.request.parameters" => JSON.dump(:name => "world", :query => "value")
      )
    end
  end

  describe "GET versioned /goodbye/:name" do
    it "creates restify spans" do
      response = HTTP
        .headers("accept-version" => "~2")
        .get("#{test_app_url}/goodbye/world?query=value")

      expect(Span.root!).to be_http_span_with_route("GET /goodbye/:name")
      expect(response.code.to_i).to eq(200)

      span = Span.find_by_name!("request handler - /goodbye/:name")
      expect(span.attributes).to include(
        "restify.type" => "request_handler",
        "restify.method" => "get",
        "http.route" => "/goodbye/:name",
        "appsignal.request.parameters" => JSON.dump(:name => "world", :query => "value")
      )
    end
  end
end
