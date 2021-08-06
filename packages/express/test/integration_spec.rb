require 'net/http'
require 'tempfile'
require 'timeout'

RSpec.describe "Express.js" do
  before(:all) do
    tmpdir = Dir.mktmpdir
    @log_path = File.join(tmpdir, "appsignal.log")
    command = "APPSIGNAL_LOG_PATH='#{tmpdir}' APPSIGNAL_DEBUG='true' APPSIGNAL_TRANSACTION_DEBUG_MODE='true' node index.js"

    Dir.chdir File.join(__dir__, 'example')

    puts command
    read, write = IO.pipe
    @pid = spawn(command, out: write)

    Timeout::timeout(15) do
      read.each do |line|
        puts line
        break if line =~ /Example app listening at/
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
      @result = Net::HTTP.get(URI('http://localhost:3000/?foo=bar'))
    end

    it "renders the index page" do
      expect(@result).to match(/Hello World!/)
    end

    it "sets the root span's name" do
      log = File.read(@log_path)
      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy()
      expect(/Set name 'GET \/' for span '#{$1}'/.match(log)).to be_truthy()
    end
  end
end
