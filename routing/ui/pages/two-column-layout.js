import html from 'solid-js/html'
import {css} from 'goober'

const styles = css`
  display: grid;
  grid: auto-flow / var(--left-column-width) var(--right-column-width);
`

export default function (props) {
  return html`
    <div
      class=${styles}
      style=${() => `
        --left-column-width: ${props.widths[0]};
        --right-column-width: ${props.widths[1]};
      `}
    >
      <div>${() => props.left}</div>
      <div>${() => props.right}</div>
    </div>
  `
}
