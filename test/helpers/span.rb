# frozen_string_literal: true

require_relative "./config_helper"

class Span
  class << self
    def all
      # Wait for spans that haven't been written yet
      sleep 1
      File.readlines(ConfigHelper.spans_file_path).map do |line|
        new(JSON.parse(line))
      end
    end

    def find_by_id(id)
      all.find do |span|
        span.id == id
      end
    end

    def find_by_attribute(key, value)
      all.find do |span|
        span.attributes[key] == value
      end
    end

    def find_by_name!(name)
      found_span = all.find do |span|
        span.name == name
      end
      raise "No span with name #{name} found" unless found_span

      found_span
    end

    def clear_all
      File.open(ConfigHelper.spans_file_path, "w").close
    end

    def roots
      all.select do |span|
        span.parent_id.nil?
      end
    end

    def root
      return if roots.length != 1

      roots.first
    end

    def root!
      raise "There is no root span" if roots.length.zero?
      raise "There is more than one root span" if roots.length > 1

      root
    end
  end

  def initialize(span_data = {})
    @name = span_data["name"]
    @id = span_data["spanId"]
    @parent_id = span_data["parentSpanId"]
    @attributes = span_data["attributes"]
    @events = span_data["events"]
    @instrumentation_library_name = span_data.dig("instrumentationLibrary", "name")
  end
  attr_reader :name, :id, :parent_id, :attributes, :events, :instrumentation_library_name

  def parent
    self.class.all.find do |span|
      span.id == parent_id
    end
  end

  def children
    self.class.all.select do |span|
      span.parent_id == id
    end
  end

  def transitive_parent_of?(child)
    while child&.parent_id
      return true if child.parent_id == id

      child = self.class.find_by_id(child.parent_id)
    end

    false
  end

  def sql_child_by_library_and_type(library:, type:)
    sql_span = children.find do |child_span|
      child_span.instrumentation_library_name == library &&
        child_span.name == type
    end

    unless sql_span
      raise(
        "No SQL span for parent `#{id}` type: #{type} "\
          "and system `#{library}` found"
      )
    end

    sql_span
  end
end
