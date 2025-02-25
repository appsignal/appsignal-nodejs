# frozen_string_literal: true

RSpec.describe "Prisma app" do
  before(:all) do
    @test_app_url = ConfigHelper.test_app_url
  end

  describe("GET /") do
    it "creates a Prisma child span on the HTTP root span" do
      response = HTTP.get("#{@test_app_url}/")
      expect(Span.root!).to be_http_span_with_route("GET /")
      expect("/").to have_express_request_handler
      expect(response.status).to eq(200)
      parent_span = Span.find_by_name!("prisma:engine:query")
      sql_query_span = parent_span.sql_child_by_library_and_type(
        :library => "prisma",
        :type => "prisma:engine:db_query"
      )

      expect(
        sql_query_span.attributes["db.query.text"]
      ).to include("SELECT \"public\".\"Post\".\"id\"")
    end
  end
end
