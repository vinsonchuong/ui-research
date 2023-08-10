import {TransactionLog} from './transaction-log.js'
import {DataStore} from './data-store.js'

export class Follower {
  #version
  #acknowledgedVersion
  #dataStore
  #log = new TransactionLog()
  #wireClient

  constructor(wireClient) {
    this.#dataStore = new DataStore(null)
    this.#wireClient = wireClient

    this.#clone()
    this.#receive()
  }

  get(path) {
    return this.#dataStore.get(path)
  }

  async update(path, value) {
    const nextVersion = crypto.randomUUID()

    this.#log.append(
      nextVersion,
      {path, value},
      {path, value: this.#dataStore.get(path)},
    )

    this.#version = nextVersion
    this.#dataStore.update(path, value)

    while (true) {
      try {
        const {previousVersion} = this.#log.getVersion(nextVersion)
        await this.#wireClient.send({previousVersion, nextVersion, path, value})
        break
      } catch {
        const updates = await this.#wireClient.getSince(
          this.#acknowledgedVersion,
        )
        for (const {version, previousVersion, update} of updates) {
          this.#processReceivedUpdate({
            previousVersion,
            nextVersion: version,
            path: update.path,
            value: update.value,
          })
        }
      }
    }
  }

  async #clone() {
    const {version, data} = await this.#wireClient.clone()

    this.#log.append(version, {path: [], value: data}, null)

    this.#acknowledgedVersion = version
    this.#version = version
    this.#dataStore.update([], data)
  }

  #receive() {
    this.#wireClient.receive((update) => this.#processReceivedUpdate(update))
  }

  #processReceivedUpdate({previousVersion, nextVersion, path, value}) {
    if (this.#log.hasVersion(nextVersion)) {
      return
    }

    const branch = []

    let current = this.#log.getLast()
    while (current && current.version !== previousVersion) {
      branch.push(current)
      current = this.#log.getPreviousVersion(current.version)
    }

    for (const {previousVersion, update, inverse} of branch) {
      this.#log.append(previousVersion, inverse, update)
      this.#dataStore.update(inverse.path, inverse.value)
    }

    this.#log.append(
      nextVersion,
      {path, value},
      {path, value: this.#dataStore.get(path)},
    )

    this.#acknowledgedVersion = nextVersion
    this.#version = nextVersion
    this.#dataStore.update(path, value)

    for (const {version, update, inverse} of branch) {
      this.#log.append(version, update, inverse)
      this.#version = version
      this.#dataStore.update(update.path, update.value)
    }
  }
}
