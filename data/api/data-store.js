import u from 'updeep'
import getIn from 'lodash/get.js'

export class DataStore {
  #data
  #subscribers = []

  constructor(data) {
    this.update([], data)
  }

  subscribe(listener) {
    this.#subscribers.push(listener)
  }

  get(path = []) {
    return path.length === 0 ? this.#data : getIn(this.#data, path)
  }

  update(path, value) {
    this.#data = u.freeze(
      path.length === 0 ? value : u.updateIn(path, value, this.#data),
    )
    for (const subscriber of this.#subscribers) {
      subscriber(path, value)
    }
  }
}
