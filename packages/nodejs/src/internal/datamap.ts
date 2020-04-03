import { datamap } from "../extension"

type Map = { [key: string]: any }

export class DataMap {
  private _ref: any
  private _data: Map

  constructor(data?: Map) {
    this._data = data || {}
    this._ref = datamap.create()

    // if we init this object with data, it should be written to
    // the extension here
    if (data) {
      Object.entries(data).forEach(([k, v]) => this.set(k, v))
    }
  }

  get ref() {
    return this._ref
  }

  set ref(arg) {
    console.error("Cannot set a ref")
  }

  public set(key: string, value: any) {
    if (!value) {
      datamap.setNull(this._ref)
    }

    switch (typeof value) {
      case "string":
        datamap.setString(key, value, this._ref)
        break
      case "number":
        if (Number.isInteger(value)) {
          datamap.setInteger(key, value, this._ref)
        } else {
          datamap.setFloat(key, value, this._ref)
        }

        break
      case "boolean":
        datamap.setBoolean(key, value, this._ref)
        break
      case "object":
        datamap.setData(key, value, this._ref)
        break
      default:
        console.warn("Could not set property on DataMap:", key, value)
        return this._data
    }

    this._data = { ...this._data, ...{ [key]: value } }

    return this._data
  }

  public isEqualTo() {}
}
