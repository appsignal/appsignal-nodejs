# frozen_string_literal: true

require "net/http"

EXAMPLE_APP_DIR = File.expand_path(File.join("..", "example"), __dir__)

RSpec.describe "Next.js" do
  before(:context) do
    @app = AppRunner.new("npm run start", EXAMPLE_APP_DIR)
    @app.run
    @app.wait_for_start!("Server ready at")
  end
  after(:context) { @app.stop }
  after { @app.cleanup }

  describe "POST /" do
    before do
      uri = URI("http://localhost:4010/")
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri.request_uri)
      request["Content-Type"] = "application/json"
      request.body = '{"query":"query { __typename }"}'
      @response = http.request(request).body
    end

    it "sets the root span's name" do
      expect(@response).to match('{"data":{"__typename":"Query"}}')

      log = @app.logs
      span_id = fetch_root_span_id(log)
      expect(log).to include("Set name 'POST /' for span '#{span_id}'")
    end
  end
end
