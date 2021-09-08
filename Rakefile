# frozen_string_literal: true

require "yaml"

namespace :build_matrix do
  namespace :semaphore do
    task :generate do
      yaml = YAML.load_file("build_matrix.yml")
      matrix = yaml["matrix"]
      semaphore = yaml["semaphore"]
      builds = []
      skipped_packages = Set.new
      matrix["nodejs"].each do |nodejs|
        nodejs_version = nodejs["nodejs"]
        setup = nodejs.fetch("setup", [])

        build_block_name = "Node.js #{nodejs_version} - Build"
        build_block = build_semaphore_task(
          "name" => build_block_name,
          "dependencies" => ["Validation"],
          "task" => {
            "env_vars" => ["name" => "NODE_VERSION", "value" => nodejs_version],
            "prologue" => {
              "commands" => setup + [
                "cache restore",
                "mono bootstrap --ci",
                "cache store"
              ]
            },
            "epilogue" => matrix["epilogue"],
            "jobs" => [
              build_semaphore_job(
                "name" => "Build",
                "commands" => [
                  "mono build",
                  "cache store $_PACKAGES_CACHE-packages-$SEMAPHORE_GIT_SHA-v$NODE_VERSION " \
                    "packages",
                  "cache store $_PACKAGES_CACHE-install-report-$SEMAPHORE_GIT_SHA-v$NODE_VERSION " \
                    "/tmp/appsignal-*-install.report"
                ]
              )
            ]
          }
        )
        builds << build_block

        primary_block_name = "Node.js #{nodejs_version} - Tests"
        primary_jobs = []
        matrix["packages"].each do |package|
          has_package_tests = package_has_tests? package["path"]
          if !has_package_tests && skipped_packages.add?(package["package"])
            puts "DEBUG: Skipping Node.js tests for #{package["package"]}: No test files found"
          end

          package["variations"].each do |variation|
            variation_name = variation.fetch("name")
            dependency_specification = variation["packages"]
            update_package_version_command, update_test_app_version_command =
              if dependency_specification
                packages = dependency_specification.map do |name, version|
                  "#{name}@#{version}"
                end.join(" ")
                [
                  "cd #{package["path"]} && npm instal #{packages} --save-dev",
                  "script/install_test_example_packages " \
                    "#{File.basename package["path"]} #{packages}"
                ]
              end

            # Run Node.js / Jest tests against specific package versions
            if has_package_tests
              # Only add a job to run Node.js / Jest tests if there are any. So
              # we don't waste a lot of time on job setup that don't do
              # anything. If a package suddenly does get tests the validation
              # step will fail, and will require this task to be re-run, so
              # that we don't forget to run those new tests.
              primary_jobs << build_semaphore_job(
                "name" => "#{package["package"]} - #{variation_name}",
                "commands" => ([
                  update_package_version_command,
                  "mono test --package=#{package["package"]}"
                ] + package.fetch("extra_commands", [])).compact
              )
            end

            # Run extra tests against specific package versions. If configured,
            # run the extra tests configured for the package.
            package.fetch("extra_tests", []).each do |test_name, extra_tests|
              primary_jobs << build_semaphore_job(
                "name" => "#{package["package"]} - #{variation_name} - #{test_name}",
                "commands" => ([update_test_app_version_command] + extra_tests).compact
              )
            end
          end
        end
        primary_block =
          build_semaphore_task(
            "name" => primary_block_name,
            "dependencies" => [build_block_name],
            "task" => {
              "env_vars" => [
                {
                  "name" => "NODE_VERSION",
                  "value" => nodejs_version
                },
                {
                  "name" => "_APPSIGNAL_SKIP_EXTENSION_INSTALL",
                  "value" => "true"
                }
              ],
              "prologue" => {
                "commands" => setup + [
                  "cache restore",
                  "cache restore $_PACKAGES_CACHE-packages-$SEMAPHORE_GIT_SHA-v$NODE_VERSION",
                  "cache restore $_PACKAGES_CACHE-install-report-$SEMAPHORE_GIT_SHA-v$NODE_VERSION",
                  "mono bootstrap --ci"
                ]
              },
              "epilogue" => matrix["epilogue"],
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
