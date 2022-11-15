# frozen_string_literal: true

RSpec.describe "NestJS APP" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe "GET /" do
    it "creates Nest and Express specific spans" do
      response = HTTP.get("#{@test_app_url}/")
      expect(response.status).to eq(200)

      expect(Span.root!).to be_http_span_with_route("GET /")
      expect("AppController.getHello").to have_nest_context_span
      expect("getHello").to have_nest_handler_span
      expect("/").to have_express_request_handler
    end
  end
end
