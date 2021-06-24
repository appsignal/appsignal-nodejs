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

        build_block_name = "Node.js #{nodejs_version} - Build"
        build_block = build_semaphore_task(
          "name" => build_block_name,
          "dependencies" => ["Validation"],
          "task" => {
            "env_vars" => ["name" => "NODE_VERSION", "value" => nodejs_version],
            "prologue" => {
              "commands" => [
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
                  "mono run --package @appsignal/nodejs-ext -- npm run build:ext",
                  "cache store $_PACKAGES_CACHE-packages-$SEMAPHORE_GIT_SHA-v$NODE_VERSION packages"
                ]
              )
            ]
          }
        )
        builds << build_block

        primary_block_name = "Node.js #{nodejs_version} - Tests"
        primary_jobs = [
          # Test minimal version of packages
          build_semaphore_job(
            "name" => "Test all packages",
            "commands" => ["mono test"]
          )
        ]
        matrix["packages"].each do |package|
          next unless package["tests"]

          package["tests"].each do |test_name, extra_tests|
            # Run extra tests
            primary_jobs << build_semaphore_job(
              "name" => "#{package["package"]} - #{test_name}",
              "commands" => extra_tests
            )
          end
        end
        primary_block =
          build_semaphore_task(
            "name" => primary_block_name,
            "dependencies" => [build_block_name],
            "task" => {
              "env_vars" => ["name" => "NODE_VERSION", "value" => nodejs_version],
              "prologue" => {
                "commands" => [
                  "cache restore",
                  "cache restore $_PACKAGES_CACHE-packages-$SEMAPHORE_GIT_SHA-v$NODE_VERSION",
                  "mono bootstrap --ci"
                ]
              },
              "jobs" => primary_jobs
            }
          )
        builds << primary_block

        secondary_jobs = []
        matrix["packages"].each do |package|
          next unless package["variations"]

          package["variations"].each_with_index do |variation, index|
            variation_name = variation.fetch("name")
            packages = variation["packages"].map { |name, version| "#{name}@#{version}" }.join(" ")
            update_package_version_command = "npm install #{packages} --save-dev"

            # Test specific package versions
            secondary_jobs << build_semaphore_job(
              "name" => "#{package["package"]} - #{variation_name}",
              "commands" => [
                update_package_version_command,
                "mono test --package=#{package["package"]}"
              ]
            )
            package["tests"].each do |test_name, extra_tests|
              # Run extra tests against specific package versions
              secondary_jobs << build_semaphore_job(
                "name" => "#{package["package"]} - #{variation_name} - #{test_name}",
                "commands" => [update_package_version_command] + extra_tests
              )
            end
          end
        end
        if secondary_jobs.count.nonzero?
          secondary_block = build_semaphore_task(
            "name" => "Node.js #{nodejs_version} - Packages",
            "dependencies" => [primary_block_name],
            "task" => {
              "env_vars" => ["name" => "NODE_VERSION", "value" => nodejs_version],
              "prologue" => {
                "commands" => [
                  "cache restore",
                  "cache restore $_PACKAGES_CACHE-packages-$SEMAPHORE_GIT_SHA-v$NODE_VERSION",
                  "mono bootstrap --ci"
                ]
              },
              "jobs" => secondary_jobs
            }
          )
          builds << secondary_block
        end
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
    "task" => task_hash.delete("task") { raise "`task` key not found for task" },
  }.merge(task_hash)
end

def build_semaphore_job(job_hash)
  {
    "name" => job_hash.delete("name") { "`name` key not found" },
    "commands" => []
  }.merge(job_hash)
end
