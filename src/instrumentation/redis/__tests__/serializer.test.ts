import { RedisDbStatementSerializer } from "../serializer"

describe("RedisDbStatementSerializer", () => {
  it("sanitizes queries without arguments", () => {
    const result = RedisDbStatementSerializer("get", [])

    expect(result).toEqual("get")
  })

  it("sanitizes queries with single arguments", () => {
    const result = RedisDbStatementSerializer("get", ["my_key"])

    expect(result).toEqual("get ?")
  })

  it("sanitizes queries with multiple argumentsj", () => {
    const result = RedisDbStatementSerializer("set", ["my_key", "my value"])

    expect(result).toEqual("set ? ?")
  })
})
