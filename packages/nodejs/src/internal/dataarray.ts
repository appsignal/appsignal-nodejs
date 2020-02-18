// the C++ extension is loaded here (via commonjs for compatibility).
// we keep this as a locally scoped variable; the C++ bindings
// should not be visible publicly.
const { dataarray } = require("../../build/Release/extension.node")

export class DataArray {
  private _ref: any
  private _data: Array<any>

  constructor(data?: Array<any>) {
    this._data = data || []
    this._ref = dataarray.create()

    // if we init this object with data, it should be written to
    // the extension here
    if (data) {
      data.forEach(val => this.append(val))
    }
  }

  get ref() {
    return this._ref;
  }

  set ref(arg) {
    console.error("Cannot set a ref")
  }

  public append(value: any): Array<any> {
    if (!value) {
      dataarray.appendNull(this._ref)
    }

    switch (typeof value) {
      case "string":
        dataarray.appendString(value, this._ref)
        break
      case "number":
        if (Number.isInteger(value)) {
          dataarray.appendInteger(value, this._ref)
        } else {
          dataarray.appendFloat(value, this._ref)
        }

        break
      case "boolean":
        dataarray.appendBoolean(value, this._ref)
        break
      case "object":
        dataarray.appendData(value, this._ref)
        break
      default:
        console.warn("Could not append to DataArray:", value)
        return this._data
    }

    this._data.push(value)

    return this._data
  }

  public isEqualTo() {}
}
