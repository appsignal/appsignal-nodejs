require "net/http"

EXAMPLE_APP_DIR = File.expand_path(File.join("..", "example"), __dir__)

RSpec.describe "Next.js" do
  before(:context) do
    @app = AppRunner.new("node server.js", EXAMPLE_APP_DIR)
    @app.run
    @app.wait_for_start!("Example app listening at")
  end
  after(:context) { @app.stop }
  after { @app.cleanup }

  describe "/" do
    before do
      @result = Net::HTTP.get(URI('http://localhost:4010/'))
    end

    it "renders the index page" do
      expect(@result).to match(/Welcome to .+Next\.js!/)
    end

    it "sets the root span's name" do
      log = @app.logs
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy()
      expect(/Set name 'GET \/' for span '#{$1}'/.match(log)).to be_truthy()
    end
  end

  describe "/blog" do
    before do
      @result = Net::HTTP.get(URI('http://localhost:4010/blog'))
    end

    it "renders the index page" do
      expect(@result).to match(/Blog/)
    end

    it "sets the root span's name" do
      log = @app.logs
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy()
      expect(/Set name 'GET \/blog' for span '#{$1}'/.match(log)).to be_truthy()
    end
  end

  describe "/post/1" do
    before do
      @result = Net::HTTP.get(URI('http://localhost:4010/post/1'))
    end

    it "renders the post page" do
      expect(@result).to match(/Post: /)
    end

    it "sets the root span's name" do
      log = @app.logs
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy()
      expect(/Set name 'GET \/post\/\[id\]' for span '#{$1}'/.match(log)).to be_truthy()
    end
  end
end
