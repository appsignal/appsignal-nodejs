import { Data } from "../internal/data"

describe("Data", () => {
  it("creates an empty map", () => {
    const map = Data.generate({})

    expect(Data.toJson(map)).toEqual({})
  })

  it("creates an empty array", () => {
    const map = Data.generate([])

    expect(Data.toJson(map)).toEqual([])
  })

  it("creates a map with nested data", () => {
    const nested = {
      string: "payload",
      int: 9999,
      float: 99.9,
      1: true,
      null: "null_key",
      null_value: null,
      array: [1, 2, "three"],
      map: { foo: "bʊr" },
      nested_array: [1, 2, "three", { foo: "bar" }],
      nested_map: { foo: "bʊr", arr: [1, 2] }
    }

    const map = Data.generate(nested)

    expect(Data.toJson(map)).toEqual(nested)
  })

  it("creates a map with a non-standard type in it", () => {
    const map = Data.generate({ key: SyntaxError() })

    expect(Data.toJson(map)).toEqual({ key: "SyntaxError" })
  })

  it("creates a map with undefined in it", () => {
    const map = Data.generate({ key: undefined })

    expect(Data.toJson(map)).toEqual({ key: "undefined" })
  })

  it("creates a map with a big int type in it", () => {
    const array = Data.generate({ key: BigInt(9007199254740991) })

    expect(Data.toJson(array)).toEqual({ key: "bigint:9007199254740991" })
  })

  it("creates an array with nested data", () => {
    const nested = [
      null,
      true,
      false,
      "string",
      9999,
      99.9,
      [1, 2, 3],
      { foo: "bʊr" },
      { arr: [1, 2, "three"], foo: "bʊr" }
    ]

    const array = Data.generate(nested)

    expect(Data.toJson(array)).toEqual(nested)
  })

  it("creates an array with a non-standard type in it", () => {
    const array = Data.generate([SyntaxError()])

    expect(Data.toJson(array)).toEqual(["SyntaxError"])
  })

  it("creates an array with undefined in it", () => {
    const array = Data.generate([undefined])

    expect(Data.toJson(array)).toEqual(["undefined"])
  })

  it("creates an array with a big int type in it", () => {
    const array = Data.generate([BigInt(9007199254740991)])

    expect(Data.toJson(array)).toEqual(["bigint:9007199254740991"])
  })
})
