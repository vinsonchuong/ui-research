import {TransactionLog} from './transaction-log.js'
import {DataStore} from './data-store.js'

export class Leader {
  #version
  #dataStore
  #log = new TransactionLog()
  #subscribers = []

  constructor(data) {
    this.#dataStore = new DataStore(data)
    this.#version = crypto.randomUUID()
    this.#log.append(this.#version, {path: [], value: data}, null)
  }

  get(path) {
    return this.#dataStore.get(path)
  }

  update(path, value) {
    const previousVersion = this.#version
    const nextVersion = crypto.randomUUID()

    this.#log.append(
      nextVersion,
      {path, value},
      {path, value: this.#dataStore.get(path)},
    )

    this.#version = nextVersion
    this.#dataStore.update(path, value)

    for (const subscriber of this.#subscribers) {
      subscriber({previousVersion, nextVersion, path, value})
    }
  }

  subscribe(onEvent) {
    this.#subscribers.push(onEvent)
  }

  clone() {
    return {
      version: this.#version,
      data: this.#dataStore.get(),
    }
  }

  getSince(version) {
    const updates = []

    let current = this.#log.getNextVersion(version)
    while (current) {
      updates.push(current)
      current = this.#log.getNextVersion(current.version)
    }

    return updates
  }

  receive({previousVersion, nextVersion, path, value}) {
    if (previousVersion !== this.#version) {
      throw new Error('Conflict')
    }

    this.#log.append(
      nextVersion,
      {path, value},
      {path, value: this.#dataStore.get(path)},
    )

    this.#dataStore.update(path, value)
    this.#version = nextVersion

    for (const subscriber of this.#subscribers) {
      subscriber({previousVersion, nextVersion, path, value})
    }
  }
}
