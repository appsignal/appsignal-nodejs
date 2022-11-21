# frozen_string_literal: true

require "http"

RSpec.describe "Express Knex app" do
  let(:test_app_url) { ConfigHelper.test_app_url }

  describe "GET / queries posts" do
    it "creates Knex spans" do
      response = HTTP.get("#{test_app_url}/")

      expect(Span.root!).to be_http_span_with_route("GET /")
      expect(response.code.to_i).to eq(200)

      span = Span.find_by_name!("first defaultdb.posts")
      expect(span.name).to eq("first defaultdb.posts")
      expect(span.attributes).to include(
        "db.statement" => %(select * from "posts" order by "id" desc limit ?)
      )
    end
  end

  describe "GET /create queries posts" do
    it "creates Knex spans" do
      response = HTTP.get("#{test_app_url}/create")

      expect(Span.root!).to be_http_span_with_route("GET /create")
      expect(response.code.to_i).to eq(200)

      count_span = Span.find_by_name!("select defaultdb.posts")
      expect(count_span.attributes).to include(
        "db.statement" => %(select count("id") from "posts")
      )

      insert_span = Span.find_by_name!("insert defaultdb.posts")
      expect(insert_span.attributes).to include(
        "db.statement" => %(insert into "posts" ("body", "title") values (?, ?), (?, ?))
      )
    end
  end
end
