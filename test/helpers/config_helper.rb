# frozen_string_literal: true

class ConfigHelper
  class << self
    def test_app_url
      ENV.fetch("TEST_APP_URL", "http://localhost:4001")
    end

    def spans_file_path
      ENV.fetch("SPANS_FILE_PATH", "/tmp/appsignal_spans.json")
    end
  end
end
