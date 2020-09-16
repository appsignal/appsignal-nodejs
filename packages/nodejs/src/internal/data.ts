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

  private static mapObject(obj: HashMap<any>, filtered: boolean) {
    let map = filtered ? datamap.createFiltered() : datamap.create()

    Object.entries(obj).forEach(([key, value]) => {
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
        case "boolean":
          datamap.setBoolean(key, value, map)
          break
        case "object":
          // check null
          if (!value) {
            datamap.setNull(key, map)
          }

          // check array
          if (Array.isArray(value)) {
            datamap.setData(this.mapArray(value, filtered), map)
          }

          // check for plain object
          if (value?.constructor.name === "Object") {
            datamap.setData(this.mapObject(value, filtered), map)
          }

          break
        default:
          // attempt to co-erce whatever the data is to a string
          datamap.setString(String(value), map)
          break
      }
    })

    return map
  }

  private static mapArray(arr: Array<any>, filtered: boolean) {
    let array = dataarray.create()

    arr.forEach(value => {
      switch (typeof value) {
        case "string":
          dataarray.setString(value, array)
          break
        case "number":
          if (Number.isInteger(value)) {
            dataarray.setInteger(value, array)
          } else {
            dataarray.setFloat(value, array)
          }

          break
        case "boolean":
          dataarray.setBoolean(value, array)
          break
        case "object":
          // check null
          if (!value) {
            dataarray.setNull(array)
          }

          // check array
          if (Array.isArray(value)) {
            dataarray.setData(this.mapArray(value, filtered), array)
          }

          // check for plain object
          if (value?.constructor.name === "Object") {
            dataarray.setData(this.mapObject(value, filtered), array)
          }

          break
        default:
          // attempt to co-erce whatever the data is to a string
          dataarray.setString(String(value), array)
          break
      }
    })

    return array
  }
}
