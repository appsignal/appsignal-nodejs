# frozen_string_literal: true

require "net/http"

EXAMPLE_APP_DIR = File.expand_path(File.join("..", "example"), __dir__)

RSpec.describe "Koa" do
  before(:context) do
    @app = AppRunner.new("node index.js", EXAMPLE_APP_DIR)
    @app.run
    @app.wait_for_start!("Example app listening at")
  end
  after(:context) { @app.stop }
  after { @app.cleanup }

  describe "/" do
    before do
      @result = Net::HTTP.get(URI("http://localhost:4010/"))
    end

    it "renders the index page" do
      expect(@result).to match(/Hello World!/)
    end

    it "sets the root span's name" do
      log = @app.logs
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy, log
      expect(log).to match(%r{Set name 'GET /' for span '#{Regexp.last_match(1)}'})
    end
  end
end
