import {render} from 'solid-js/web'
import html from 'solid-js/html'

export class Renderer {
  #container
  #dispose

  constructor(container) {
    this.#container = container
  }

  render(Component, props) {
    if (this.#dispose) {
      this.#dispose()
    }

    this.#dispose = render(
      () => html`<${Component} ...${props} />`,
      this.#container,
    )
  }

  unrender() {
    if (this.#dispose) {
      this.#dispose()
    }
  }
}
