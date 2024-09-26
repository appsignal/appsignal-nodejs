import { Event, EventCheckInType } from "../../check_in/event"

describe("Event", () => {
  describe(".describe()", () => {
    it("describes an empty list of events", () => {
      expect(Event.describe([])).toBe("no check-in events")
    })

    it("describes a list of many events by count", () => {
      const events = [
        new Event({ identifier: "1", check_in_type: "cron" }),
        new Event({ identifier: "2", check_in_type: "cron" })
      ]
      expect(Event.describe(events)).toBe("2 check-in events")
    })

    it("describes a single cron event", () => {
      const event = new Event({
        identifier: "identifier",
        check_in_type: "cron",
        kind: "start",
        digest: "some-digest"
      })
      expect(Event.describe([event])).toBe(
        "cron check-in `identifier` start event (digest some-digest)"
      )
    })

    it("describes a single heartbeat event", () => {
      const event = new Event({
        identifier: "identifier",
        check_in_type: "heartbeat"
      })
      expect(Event.describe([event])).toBe(
        "heartbeat check-in `identifier` event"
      )
    })

    it("describes a single unknown event", () => {
      const event = new Event({
        identifier: "identifier",
        check_in_type: "unknown" as EventCheckInType
      })
      expect(Event.describe([event])).toBe("unknown check-in event")
    })
  })

  describe(".isRedundant()", () => {
    it("returns false if the events have different types", () => {
      const event = new Event({ identifier: "1", check_in_type: "cron" })
      const newEvent = new Event({
        identifier: "1",
        check_in_type: "heartbeat"
      })

      expect(event.isRedundant(newEvent)).toBe(false)
    })

    it("returns false if the events have an unknown type", () => {
      const event = new Event({
        identifier: "1",
        check_in_type: "unknown" as EventCheckInType
      })
      const newEvent = new Event({
        identifier: "1",
        check_in_type: "unknown" as EventCheckInType
      })

      expect(event.isRedundant(newEvent)).toBe(false)
    })

    it("returns false if heartbeat events have different identifiers", () => {
      const event = new Event({ identifier: "1", check_in_type: "heartbeat" })
      const newEvent = new Event({
        identifier: "2",
        check_in_type: "heartbeat"
      })

      expect(event.isRedundant(newEvent)).toBe(false)
    })

    it("returns true if heartbeat events have the same identifier", () => {
      const event = new Event({ identifier: "1", check_in_type: "heartbeat" })
      const newEvent = new Event({
        identifier: "1",
        check_in_type: "heartbeat"
      })

      expect(event.isRedundant(newEvent)).toBe(true)
    })

    it("returns false if cron events have different identifiers", () => {
      const event = new Event({ identifier: "1", check_in_type: "cron" })
      const newEvent = new Event({ identifier: "2", check_in_type: "cron" })

      expect(event.isRedundant(newEvent)).toBe(false)
    })

    it("returns false if cron events have different digests", () => {
      const event = new Event({
        identifier: "1",
        digest: "1",
        check_in_type: "cron"
      })
      const newEvent = new Event({
        identifier: "1",
        digest: "2",
        check_in_type: "cron"
      })

      expect(event.isRedundant(newEvent)).toBe(false)
    })

    it("returns false if cron events have different kinds", () => {
      const event = new Event({
        identifier: "1",
        kind: "start",
        check_in_type: "cron"
      })
      const newEvent = new Event({
        identifier: "1",
        kind: "finish",
        check_in_type: "cron"
      })

      expect(event.isRedundant(newEvent)).toBe(false)
    })

    it("returns true if cron events have the same identifier, digest, and kind", () => {
      const event = new Event({
        identifier: "1",
        digest: "1",
        kind: "start",
        check_in_type: "cron"
      })
      const newEvent = new Event({
        identifier: "1",
        digest: "1",
        kind: "start",
        check_in_type: "cron"
      })

      expect(event.isRedundant(newEvent)).toBe(true)
    })
  })

  describe("JSON serialization", () => {
    it("serializes a heartbeat event", () => {
      const event = new Event({
        identifier: "1",
        check_in_type: "heartbeat"
      })

      const serialised = JSON.stringify(event)

      expect(serialised).toMatch('"identifier":"1"')
      expect(serialised).toMatch('"check_in_type":"heartbeat"')
      expect(serialised).toMatch('"timestamp":')
      expect(serialised).not.toMatch('"digest":')
      expect(serialised).not.toMatch('"kind":')

      const parsed = JSON.parse(serialised)

      expect(parsed).toEqual({
        identifier: "1",
        check_in_type: "heartbeat",
        timestamp: expect.any(Number)
      })
    })

    it("serializes a cron event", () => {
      const event = new Event({
        identifier: "1",
        check_in_type: "cron",
        kind: "start",
        digest: "digest"
      })

      const serialised = JSON.stringify(event)

      expect(serialised).toMatch('"identifier":"1"')
      expect(serialised).toMatch('"check_in_type":"cron"')
      expect(serialised).toMatch('"kind":"start"')
      expect(serialised).toMatch('"digest":"digest"')
      expect(serialised).toMatch('"timestamp":')

      const parsed = JSON.parse(serialised)

      expect(parsed).toEqual({
        identifier: "1",
        check_in_type: "cron",
        kind: "start",
        digest: "digest",
        timestamp: expect.any(Number)
      })
    })
  })
})
