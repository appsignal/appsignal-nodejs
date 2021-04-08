require 'net/http'

RSpec.describe "Next.js" do
  around do |example|
    pid = spawn("cd #{File.join(__dir__, 'example')} && node server.js")
    sleep(10)

    begin
      example.run
    ensure
      Process.kill 3, pid
    end
  end

  it "renders the index page" do
    uri = URI('http://localhost:3000/')
    expect(Net::HTTP.get(uri)).to match(/Welcome to .+Next\.js!/)
  end
end
