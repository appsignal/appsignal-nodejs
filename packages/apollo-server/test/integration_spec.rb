require 'net/http'
require 'tempfile'
require 'timeout'

RSpec.describe 'Next.js' do
  before(:all) do
    tmpdir = Dir.mktmpdir
    @log_path = File.join(tmpdir, 'appsignal.log')
    command = "APPSIGNAL_LOG_PATH='#{tmpdir}' APPSIGNAL_DEBUG='true' APPSIGNAL_TRANSACTION_DEBUG_MODE='true' node index.js"

    Dir.chdir File.join(__dir__, 'example')

    puts command
    read, write = IO.pipe
    @pid = spawn(command, out: write)

    Timeout.timeout(15) do
      read.each do |line|
        puts line
        break if line =~ /Server ready at/
      end
    end
  end

  after(:all) do
    Process.kill 3, @pid
  end

  after do
    File.delete(@log_path)
  end

  describe 'POST /' do
    before do
      uri = URI('http://localhost:4000/')
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri.request_uri)
      request["Content-Type"] = 'application/json'
      request.body = '{"query":"query { __typename }"}'
      @result = http.request(request).body
    end

    it 'renders the post page' do
      expect(@result).to match('{"data":{"__typename":"Query"}}')
    end

    it "sets the root span's name" do
      log = File.read(@log_path)

      expect(/Start root span '(\w+)' in 'web'/.match(log)).to be_truthy
      expect(%r{Set name 'POST /' for span '#{Regexp.last_match(1)}'}.match(log)).to be_truthy
    end
  end
end
