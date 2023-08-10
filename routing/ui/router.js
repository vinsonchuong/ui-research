import {createRouter} from 'radix3'
import {createBrowserHistory} from 'history'

export default class Router {
  #history
  #router

  constructor(routes = []) {
    this.#history = createBrowserHistory()
    this.#router = createRouter()

    for (const route of routes) {
      this.addRoute(route)
    }
  }

  addRoute({pattern, ...data}) {
    this.#router.insert(pattern, data)
  }

  removeRoute({pattern}) {
    this.#router.remove(pattern)
  }

  currentRoute() {
    return this.#router.lookup(this.#history.location.pathname)
  }

  subscribe(listener) {
    return this.#history.listen(() => {
      listener(this.currentRoute())
    })
  }

  handlesUrl(url) {
    return Boolean(this.#router.lookup(url))
  }

  navigate(url) {
    if (url !== this.#history.location.pathname) {
      this.#history.push(url)
    }
  }
}
