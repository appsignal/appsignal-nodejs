require 'net/http'
require 'tempfile'
require 'timeout'

RSpec.describe "Next.js" do
  before(:all) do
    tmpdir = Dir.mktmpdir
    @log_path = File.join(tmpdir, "appsignal.log")
    command = "APPSIGNAL_LOG_PATH='#{tmpdir}' APPSIGNAL_DEBUG='true' APPSIGNAL_TRANSACTION_DEBUG_MODE='true' node server.js"

    Dir.chdir File.expand_path("../example", __dir__)

    puts command
    read, write = IO.pipe
    @pid = spawn(command, out: write)

    Timeout::timeout(15) do
      read.each do |line|
        puts line
        break if line =~ /Ready on/
      end
    end
  end

  after(:all) do
    Process.kill 3, @pid
  end

  after do
    File.delete(@log_path)
  end

  describe "/" do
    before do
      @result = Net::HTTP.get(URI('http://localhost:4010/'))
    end

    it "renders the index page" do
      expect(@result).to match(/Welcome to .+Next\.js!/)
    end

    it "sets the root span's name" do
      log = File.read(@log_path)
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
      log = File.read(@log_path)
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
      log = File.read(@log_path)

      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy()
      expect(/Set name 'GET \/post\/\[id\]' for span '#{$1}'/.match(log)).to be_truthy()
    end
  end
end
