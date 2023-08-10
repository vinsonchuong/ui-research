import html from 'solid-js/html'
import TwoColumnLayout from '../two-column-layout.js'
import Navigation from '../navigation.js'

export default function () {
  return html`
    <${TwoColumnLayout}
      widths=${['1fr', '3fr']}
      left=${html`<${Navigation} />`}
      right=${html`
        <article>
          <p>Page 3</p>
        </article>
      `}
    />
  `
}
