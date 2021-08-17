# frozen_string_literal: true

require "timeout"
require "tempfile"

class AppRunner
  class AppError < StandardError; end
  class WaitForStartTimeoutError < Timeout::Error; end
  class StopTimeoutError < Timeout::Error; end

  def initialize(command, dir)
    @command = command
    @dir = dir
    @output_lines = []
    @output_mutex = Mutex.new
  end

  # Start the example app
  def run
    tmpdir = Dir.mktmpdir
    @log_path = File.join(tmpdir, "appsignal.log")
    env = {
      "APPSIGNAL_LOG_PATH" => tmpdir,
      "APPSIGNAL_DEBUG" => "true",
      "APPSIGNAL_TRANSACTION_DEBUG_MODE" => "true"
    }

    puts "Starting app: #{@command}"
    read, write = IO.pipe
    @pid = spawn(env, @command, :out => write, :chdir => @dir)
    @log_thread =
      Thread.new do
        while line = read.readline # rubocop:disable Lint/AssignmentInCondition
          # Output lines as the program runs
          puts "| #{line}"
          # Store the output for later
          @output_mutex.synchronize do
            @output_lines << line
          end
        end
      rescue EOFError
        # Do nothing, nothing to read anymore
      end
  end

  # Block execution of the Ruby app until the example app has printed the
  # String supplied in the `message` argument.
  def wait_for_start!(message, options = {})
    raise AppError, output unless running?

    Timeout.timeout(options.fetch(:timeout, 15), WaitForStartTimeoutError) do
      loop do
        break if output.include?(message)

        sleep 0.05
      end
    end
  end

  # Check if the example app is running or not.
  # It may have crashed or exited on its own.
  def running?
    # Check all processes that are started with the given command.
    # Filter out any defunct processes that haven't been reaped, like in
    # containers.
    #
    # The `-o` option on `ps` will allow us to configure which columns are
    # printed and reduces the risk of false positives on other random output.
    # The `=` symbol in the column names indicates that we don't want to print
    # a line with a heading for each column.
    processes = `ps -o "state=,command=" -p "#{@pid}" | grep -v "Z+" | grep -v "defunct"`
    # Any output remaining? The app must be running.
    processes.lines.any?
  end

  # Stop the example app if it is running
  def stop
    Timeout.timeout(15, StopTimeoutError) do
      while running?
        # Send signal 2 on macOS and signal 3 on Linux to send the stop signal
        # to the test app process. This way the test app process is really
        # stopped after running the test suite. I don't know why it's
        # different, but this way works.
        signal = RbConfig::CONFIG["host_os"].include?("darwin") ? 2 : 3
        Process.kill signal, @pid
        sleep 0.5
      end
    end
    @log_thread.kill
  end

  # Remove any temporary files from the file system and clean up the output
  # stored in memory between tests.
  def cleanup
    File.delete(@log_path)
    @output_mutex.synchronize do
      @output_lines = []
    end
  end

  # Return the output (STDOUT) of the example app
  def output
    @output_mutex.synchronize do
      @output_lines.join("\n")
    end
  end

  # Read the AppSignal log file from the file system
  def logs
    File.read(@log_path)
  end
end
