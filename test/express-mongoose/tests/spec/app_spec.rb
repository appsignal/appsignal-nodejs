# frozen_string_literal: true

RSpec.describe "Prisma app" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe("GET /") do
    it "creates a Mongoose child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/")
      expect(Span.root!).to be_http_span_with_route("GET /")
      expect("/").to have_express_request_handler
      expect(response.status).to eq(200)
      Span.find_by_name!("mongoose.Post.find")
    end
  end
end
