require 'net/http'
require 'tempfile'

RSpec.describe "Next.js" do
  around do |example|
    tmpdir = Dir.mktmpdir
    @log_path = File.join(tmpdir, "appsignal.log")
    command = "APPSIGNAL_LOG_PATH='#{tmpdir}' APPSIGNAL_DEBUG='true' APPSIGNAL_TRANSACTION_DEBUG_MODE='true' node server.js"

    Dir.chdir File.join(__dir__, 'example')

    puts command
    read, write = IO.pipe
    @pid = spawn(command, out: write)

    read.each do |line|
      puts line
      break if line =~ /Ready on/
    end

    uri = URI('http://localhost:3000/')

    begin
      @result = Net::HTTP.get(uri)
      example.run
    ensure
      Process.kill 3, @pid
    end
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
