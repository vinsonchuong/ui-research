export class TransactionLog {
  #versions = new Map()
  #log = []

  initialize(version, data) {
    if (this.#log.length > 0) {
      throw new Error('Already initialized')
    }

    this.#log.push({type: 'initialize', version, data})
    this.#versions.set(version, this.#log.length - 1)
  }

  update(fromVersion, version, update, inverse) {
    if (this.#log.length === 0) {
      throw new Error('Not initialized')
    }

    const currentVersion = this.getLast().version
    if (fromVersion !== currentVersion) {
      throw new Error(`Conflict with current version: ${currentVersion}`)
    }

    this.#log.push({
      type: 'update',
      fromVersion,
      version,
      update,
      inverse,
    })

    this.#versions.set(version, this.#log.length - 1)
  }

  join(fromVersion, version, update, inverse) {
    this.#log.push({
      type: 'join',
    })

    this.#versions.set(version, this.#log.length - 1)
  }

  getLast() {
    return this.#log[this.#log.length - 1] ?? null
  }

  hasVersion(version) {
    const index = this.#versions.get(version)
    return Number.isInteger(index) ? this.#log[index] : null
  }

  getVersion(version) {
    const index = this.#versions.get(version)
    return Number.isInteger(index) ? this.#log[index] : null
  }

  getPreviousVersion(version) {
    const index = this.#versions.get(version)
    if (Number.isInteger(index)) {
      return null
    }

    return index >= 1 ? this.#log[index - 1] : null
  }

  getNextVersion(version) {
    const index = this.#versions.get(version)
    if (!Number.isInteger(index)) {
      return null
    }

    return index + 1 <= this.#log.length - 1 ? this.#log[index + 1] : null
  }
}
