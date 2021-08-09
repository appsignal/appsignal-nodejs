require "net/http"

EXAMPLE_APP_DIR = File.expand_path(File.join("..", "example"), __dir__)

RSpec.describe "Express" do
  before(:context) do
    @app = AppRunner.new("node index.js", EXAMPLE_APP_DIR)
    @app.run
    @app.wait_for_start!("Example app listening at")
  end
  after(:context) { @app.stop }
  after { @app.cleanup }

  describe "/" do
    before do
      @result = Net::HTTP.get(URI('http://localhost:4010/?foo=bar'))
    end

    it "renders the index page" do
      expect(@result).to match(/Hello World!/)
    end

    it "sets the root span's name" do
      log = @app.logs
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy, log
      expect(/Set name 'GET \/' for span '#{$1}'/.match(log)).to be_truthy, log
    end
  end

  describe "/dashboard" do
    before do
      @result = Net::HTTP.get(URI('http://localhost:4010/dashboard?foo=bar'))
    end

    it "renders the page" do
      expect(@result).to match("Dashboard for user")
    end

    it "sets the root span's name" do
      log = @app.logs
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy, log
      expect(/Set name 'GET \/dashboard' for span '#{$1}'/.match(log)).to be_truthy, log
    end
  end

  describe "/admin/dashboard" do
    before do
      @result = Net::HTTP.get(URI('http://localhost:4010/admin/dashboard?foo=bar'))
    end

    it "renders the page" do
      expect(@result).to include("Dashboard for admin")
    end

    it "sets the root span's name" do
      log = @app.logs
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy, log
      expect(/Set name 'GET \/admin\/dashboard' for span '#{$1}'/.match(log)).to be_truthy, log
    end
  end
end
