import { HashMap } from "@appsignal/types"
import { datamap, dataarray } from "../extension"

export class Data {
  public static generate(
    data: Array<any> | HashMap<any>,
    filtered: boolean = false
  ) {
    if (data.constructor.name === "Object") {
      return this.mapObject(data, filtered)
    } else if (Array.isArray(data)) {
      return this.mapArray(data, filtered)
    } else {
      throw new Error(
        `Body of type ${data.constructor.name} should be a Object or Array`
      )
    }
  }

  public static toJson(data: typeof datamap | typeof dataarray) {
    return JSON.parse(datamap.toJson(data))
  }

  private static mapObject(hash_value: HashMap<any>, filtered: boolean): any {
    let map = filtered ? datamap.createFiltered() : datamap.create()

    Object.entries(hash_value).forEach(([key, value]) => {
      switch (typeof value) {
        case "string":
          datamap.setString(key, value, map)
          break
        case "number":
          if (Number.isInteger(value)) {
            datamap.setInteger(key, value, map)
          } else {
            datamap.setFloat(key, value, map)
          }

          break
        case "bigint":
          datamap.setString(key, `bigint:${value}`, map)
          break
        case "boolean":
          datamap.setBoolean(key, value, map)
          break
        case "undefined":
          datamap.setString(key, "undefined", map)
          break
        case "object":
          if (!value) {
            datamap.setNull(key, map)
          } else if (Array.isArray(value)) {
            datamap.setData(key, this.mapArray(value, filtered), map)
          } else if (value?.constructor.name === "Object") {
            datamap.setData(key, this.mapObject(value, filtered), map)
          } else {
            // attempt to co-erce whatever the data is to a string
            datamap.setString(key, String(value), map)
          }

          break
      }
    })

    return map
  }

  private static mapArray(array_value: Array<any>, filtered: boolean) {
    let array = dataarray.create()

    array_value.forEach(value => {
      switch (typeof value) {
        case "string":
          dataarray.appendString(value, array)
          break
        case "number":
          if (Number.isInteger(value)) {
            dataarray.appendInteger(value, array)
          } else {
            dataarray.appendFloat(value, array)
          }

          break
        case "bigint":
          dataarray.appendString(`bigint:${value}`, array)
          break
        case "boolean":
          dataarray.appendBoolean(value, array)
          break
        case "undefined":
          dataarray.appendString("undefined", array)
          break
        case "object":
          // check null
          if (!value) {
            dataarray.appendNull(array)
          } else if (Array.isArray(value)) {
            dataarray.appendData(this.mapArray(value, filtered), array)
          } else if (value?.constructor.name === "Object") {
            dataarray.appendData(this.mapObject(value, filtered), array)
          } else {
            // attempt to co-erce whatever the data is to a string
            dataarray.appendString(String(value), array)
          }

          break
      }
    })

    return array
  }
}
