import html from 'solid-js/html'
import Page from './page.js'

export default function (props) {
  return html`<${Page} router=${() => props.router} />`
}
