import {BlockingQueue} from './blocking-queue.js'

export class TestWireClient {
  #leader
  #unsentMessages = new BlockingQueue()
  #sentMessages = new BlockingQueue()
  #processedMessages = new BlockingQueue()

  constructor(leader) {
    this.#leader = leader
  }

  async waitFor(command) {
    await this.#unsentMessages.pull(command)
    this.#sentMessages.push(command)
    await this.#processedMessages.pull(command)
  }

  async #waitToSend(command) {
    this.#unsentMessages.push(command)
    await this.#sentMessages.pull(command)
  }

  #processMessage(command) {
    this.#processedMessages.push(command)
  }

  async clone() {
    await this.#waitToSend('clone')
    const data = await this.#leader.clone()
    this.#processMessage('clone')
    return data
  }

  async getSince(version) {
    await this.#waitToSend('get-since')
    const data = this.#leader.getSince(version)
    this.#processMessage('get-since')
    return data
  }

  async receive(callback) {
    this.#leader.subscribe(
      async ({previousVersion, nextVersion, path, value}) => {
        await this.#waitToSend('receive')
        callback({previousVersion, nextVersion, path, value})
        this.#processMessage('receive')
      },
    )
  }

  async send({previousVersion, nextVersion, path, value}) {
    await this.#waitToSend('send')
    try {
      this.#leader.receive({previousVersion, nextVersion, path, value})
    } finally {
      this.#processMessage('send')
    }
  }
}
