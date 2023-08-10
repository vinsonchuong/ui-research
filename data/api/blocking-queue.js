import {fromQueue} from 'heliograph'

export class BlockingQueue {
  #queues = new Map()

  #getQueue(key) {
    if (this.#queues.has(key)) {
      return this.#queues.get(key)
    }

    const queue = fromQueue()
    this.#queues.set(key, queue)
    return queue
  }

  push(key) {
    this.#getQueue(key).push(key)
  }

  async pull(key) {
    await this.#getQueue(key).next()
  }
}
