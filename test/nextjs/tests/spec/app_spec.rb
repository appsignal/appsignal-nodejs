# frozen_string_literal: true

RSpec.describe "NextJS app" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe("GET /") do
    it "creates an HTTP root span" do
      response = HTTP.get("#{@test_app_url}/api/hello")
      root_span = Span.find_by_attribute("http.target", "/api/hello")
      expect(root_span).to be_http_span_with_route("HTTP GET")
      expect(response.status).to eq(200)
    end
  end
end
