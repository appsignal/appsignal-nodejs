# frozen_string_literal: true

RSpec.describe "Koa + Mongo app" do
  before(:all) do
    @test_app_url = ENV.fetch("TEST_APP_URL")
  end

  describe "GET /" do
    it "creates Mongo child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/")
      expect(response.status).to eq(200)

      expect(Span.root!).to be_http_span_with_route("GET /")
      expect("/").to have_koa_router_span

      mongodb_span = Span.find_by_name!("mongodb.find")
      expect(mongodb_span.attributes).to include({
        "db.mongodb.collection" => "posts"
      })
    end
  end
end
