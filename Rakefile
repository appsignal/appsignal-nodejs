# frozen_string_literal: true

require "set"
require "yaml"

CACHE_VERSION = "v1"
CI_WORKFLOW_FILE = ".github/workflows/ci.yml"

namespace :build_matrix do
  namespace :github do
    task :generate do
      yaml = YAML.load_file("build_matrix.yml")
      matrix = yaml["matrix"]
      github = yaml["github"]
      jobs = {}
      matrix["nodejs"].each do |nodejs|
        nodejs_version = nodejs["nodejs"]

        job_name = "Node.js #{nodejs_version}"
        build_job_key = "build_#{nodejs_version}"
        build_cache_key = "#{CACHE_VERSION}-package-build-#{nodejs_version}-${{github.run_id}}"
        jobs[build_job_key] = {
          "name" => "#{job_name} - Build",
          "runs-on" => "ubuntu-latest",
          "needs" => "validation",
          "steps" => [
            {
              "name" => "Checkout project",
              "uses" => "actions/checkout@v4"
            },
            {
              "name" => "Checkout Mono",
              "uses" => "actions/checkout@v4",
              "with" => {
                "repository" => "appsignal/mono",
                "path" => "tmp/mono"
              }
            },
            {
              "name" => "Install Node.js",
              "uses" => "actions/setup-node@v4",
              "with" => {
                "node-version" => nodejs_version,
                "cache" => "npm",
                "cache-dependency-path" => "package-lock.json"
              }
            },
            {
              "name" => "Install dependencies",
              "run" => "tmp/mono/bin/mono bootstrap --ci"
            },
            {
              "name" => "Build package",
              "run" => "tmp/mono/bin/mono build"
            },
            {
              "name" => "Check install report",
              "run" =>
                "cat ext/install.report; cat ext/install.report | grep '\"status\": \"success\"'"
            },
            {
              "name" => "Save build cache",
              "uses" => "actions/cache/save@v4",
              "with" => {
                "key" => build_cache_key,
                "path" => <<~PATHS
                  build/
                  dist/
                  ext/
                PATHS
              }
            }
          ]
        }

        unit_test_job_key = "test_#{nodejs_version}_unit"
        jobs[unit_test_job_key] = {
          "name" => "#{job_name} - Tests",
          "needs" => build_job_key,
          "runs-on" => "ubuntu-latest",
          "steps" => [
            {
              "name" => "Checkout project",
              "uses" => "actions/checkout@v4"
            },
            {
              "name" => "Checkout Mono",
              "uses" => "actions/checkout@v4",
              "with" => {
                "repository" => "appsignal/mono",
                "path" => "tmp/mono"
              }
            },
            {
              "name" => "Install Node.js",
              "uses" => "actions/setup-node@v4",
              "with" => {
                "node-version" => nodejs_version,
                "cache" => "npm",
                "cache-dependency-path" => "package-lock.json"
              }
            },
            {
              "name" => "Restore build cache",
              "uses" => "actions/cache/restore@v4",
              "with" => {
                "fail-on-cache-miss" => true,
                "key" => build_cache_key,
                "path" => <<~PATHS
                  build/
                  dist/
                  ext/
                PATHS
              }
            },
            {
              "name" => "Install dependencies",
              "run" => "tmp/mono/bin/mono bootstrap --ci"
            },
            {
              "name" => "Run tests",
              "run" => "tmp/mono/bin/mono test"
            },
            {
              "name" => "Run tests for install failure",
              "run" => "npm run test:failure"
            }
          ]
        }

        # Run extra tests against specific package versions. If configured,
        # run the extra tests configured for the package.
        test_key = "diagnose"
        diagnose_job_key = "test_#{nodejs_version}_extra_#{test_key}"
        jobs[diagnose_job_key] = {
          "name" => "#{job_name} - Extra test - #{test_key}",
          "needs" => build_job_key,
          "runs-on" => "ubuntu-latest",
          "steps" => [
            {
              "name" => "Checkout project",
              "uses" => "actions/checkout@v4",
              "with" => { "submodules" => true }
            },
            {
              "name" => "Checkout Mono",
              "uses" => "actions/checkout@v4",
              "with" => {
                "repository" => "appsignal/mono",
                "path" => "tmp/mono"
              }
            },
            {
              "name" => "Install Ruby",
              "uses" => "ruby/setup-ruby@v1",
              "with" => {
                "ruby-version" => "3.3",
                "bundler-cache" => true
              }
            },
            {
              "name" => "Install Node.js",
              "uses" => "actions/setup-node@v4",
              "with" => {
                "node-version" => nodejs_version,
                "cache" => "npm",
                "cache-dependency-path" => "package-lock.json"
              }
            },
            {
              "name" => "Restore build cache",
              "uses" => "actions/cache/restore@v4",
              "with" => {
                "fail-on-cache-miss" => true,
                "key" => build_cache_key,
                "path" => <<~PATHS
                  build/
                  dist/
                  ext/
                PATHS
              }
            },
            {
              "name" => "Install dependencies",
              "run" => "tmp/mono/bin/mono bootstrap --ci"
            },
            {
              "name" => "Run tests",
              "run" => "LANGUAGE=nodejs test/integration/diagnose/bin/test"
            }
          ]
        }

        jobs["cleanup_#{nodejs_version}"] = {
          "name" => "#{job_name} - Clean up",
          "needs" => [
            unit_test_job_key,
            diagnose_job_key
          ],
          "runs-on" => "ubuntu-latest",
          "steps" => [
            {
              "name" => "Checkout project",
              "uses" => "actions/checkout@v4"
            },
            {
              "name" => "Delete build cache",
              "run" => "gh cache delete #{build_cache_key}",
              "env" => {
                "GH_TOKEN" => "${{secrets.GITHUB_TOKEN}}"
              }
            }
          ]
        }
      end

      github["jobs"].merge!(jobs)

      header = "# DO NOT EDIT\n" \
        "# This is a generated file by the `rake build_matrix:github:generate` task.\n" \
        "# See `build_matrix.yml` for the build matrix.\n" \
        "# Generate this file with `rake build_matrix:github:generate`.\n"
      generated_yaml = header + YAML.dump(github)
      File.write(CI_WORKFLOW_FILE, generated_yaml)
      puts "Generated `#{CI_WORKFLOW_FILE}`"
      puts "Job count: #{jobs.length}"
    end

    task :validate => :generate do
      `git status | grep #{CI_WORKFLOW_FILE} 2>&1`
      if $?.exitstatus.zero? # rubocop:disable Style/SpecialGlobalVars
        puts "The `#{CI_WORKFLOW_FILE}` is modified. The changes were not committed."
        puts "Please run `rake build_matrix:github:generate` and commit the changes."
        exit 1
      end
    end
  end
end
