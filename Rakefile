# frozen_string_literal: true

require "set"
require "yaml"

namespace :build_matrix do
  namespace :semaphore do
    task :generate do
      yaml = YAML.load_file("build_matrix.yml")
      matrix = yaml["matrix"]
      semaphore = yaml["semaphore"]
      builds = []
      matrix["nodejs"].each do |nodejs|
        nodejs_version = nodejs["nodejs"]
        setup = nodejs.fetch("setup", [])
        env_vars = nodejs.fetch("env_vars", [])

        build_block_name = "Node.js #{nodejs_version} - Build"
        build_block = build_semaphore_task(
          "name" => build_block_name,
          "dependencies" => ["Validation"],
          "task" => {
            "env_vars" => env_vars + [
              {
                "name" => "NODE_VERSION",
                "value" => nodejs_version
              }
            ],
            "prologue" => {
              "commands" => setup + [
                "cache restore",
                "mono bootstrap --ci",
                "cache store"
              ]
            },
            "jobs" => [
              build_semaphore_job(
                "name" => "Build",
                "commands" => [
                  "mono build",
                  "cache delete $_PACKAGE_CACHE-dist-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID",
                  "cache store  $_PACKAGE_CACHE-dist-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID dist",
                  "cache delete $_PACKAGE_CACHE-ext-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID",
                  "cache store  $_PACKAGE_CACHE-ext-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID ext",
                  "cache delete $_PACKAGE_CACHE-build-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID",
                  "cache store  $_PACKAGE_CACHE-build-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID build",
                  "cat ext/install.report; cat ext/install.report | grep '\"status\": \"success\"'"
                ]
              )
            ]
          }
        )
        builds << build_block

        primary_block_name = "Node.js #{nodejs_version} - Tests"
        primary_jobs = []
        package = matrix["package"]
        primary_jobs << build_semaphore_job(
          "name" => "Test package",
          "commands" => ([
            "mono test"
          ] + package.fetch("extra_commands", [])).compact
        )

        # Run extra tests against specific package versions. If configured,
        # run the extra tests configured for the package.
        package.fetch("extra_tests", []).each do |test_name, extra_tests|
          primary_jobs << build_semaphore_job(
            "name" => "Extra test - #{test_name}",
            "commands" => extra_tests
          )
        end
        primary_block =
          build_semaphore_task(
            "name" => primary_block_name,
            "dependencies" => [build_block_name],
            "task" => {
              "env_vars" => env_vars + [
                {
                  "name" => "NODE_VERSION",
                  "value" => nodejs_version
                },
                {
                  "name" => "_APPSIGNAL_EXTENSION_INSTALL",
                  "value" => "false"
                }
              ],
              "prologue" => {
                "commands" => setup + [
                  "cache restore",
                  "cache restore $_PACKAGE_CACHE-dist-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID",
                  "cache restore $_PACKAGE_CACHE-ext-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID",
                  "cache restore $_PACKAGE_CACHE-build-v$NODE_VERSION-$SEMAPHORE_WORKFLOW_ID",
                  "mono bootstrap --ci"
                ]
              },
              "jobs" => primary_jobs
            }
          )
        builds << primary_block
      end

      semaphore["blocks"] += builds

      header = "# DO NOT EDIT\n" \
        "# This is a generated file by the `rake build_matrix:semaphore:generate` task.\n" \
        "# See `build_matrix.yml` for the build matrix.\n" \
        "# Generate this file with `rake build_matrix:semaphore:generate`.\n"
      generated_yaml = header + YAML.dump(semaphore)
      File.write(".semaphore/semaphore.yml", generated_yaml)
      puts "Generated `.semaphore/semaphore.yml`"
      puts "Task count: #{builds.length}"
      puts "Job count: #{builds.sum { |block| block["task"]["jobs"].count }}"
    end

    task :validate => :generate do
      `git status | grep .semaphore/semaphore.yml 2>&1`
      if $?.exitstatus.zero? # rubocop:disable Style/SpecialGlobalVars
        puts "The `.semaphore/semaphore.yml` is modified. The changes were not committed."
        puts "Please run `rake build_matrix:semaphore:generate` and commit the changes."
        exit 1
      end
    end
  end
end

def build_semaphore_task(task_hash)
  {
    "name" => task_hash.delete("name") { raise "`name` key not found for task" },
    "dependencies" => [],
    "task" => task_hash.delete("task") { raise "`task` key not found for task" }
  }.merge(task_hash)
end

def build_semaphore_job(job_hash)
  {
    "name" => job_hash.delete("name") { "`name` key not found" },
    "commands" => []
  }.merge(job_hash)
end

def package_has_tests?(package)
  test_dir = File.join(package, "src/__tests__")
  # Has a dedicated test dir and it contains files
  return true if Dir.exist?(test_dir) && Dir.glob(File.join(test_dir, "**", "*.*s")).any?

  Dir
    .glob(File.join(package, "**/*.test.*s"))
    .reject { |file| file.include?("/node_modules/") }
    .any?
end
