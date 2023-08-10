import {lazy, Suspense, createSignal, createEffect, onCleanup} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import html from 'solid-js/html'

export default function (props) {
  const [route, setRoute] = createSignal(props.router.currentRoute())

  createEffect(() => {
    const unsubscribe = props.router.subscribe((route) => {
      setRoute(route)
    })
    onCleanup(unsubscribe)
  })

  return html`
    <div
      onClick=${(event) => {
        event.preventDefault()
        const element = event.target
        if (element instanceof HTMLAnchorElement) {
          const href = element.getAttribute('href')
          if (props.router.handlesUrl(href)) {
            event.preventDefault()
            props.router.navigate(href)
          }
        }
      }}
    >
      <${Suspense} fallback=${html`<div>Loading</div>`}>
        <${PageLoader} route=${() => route()} />
      <//>
    <//>
  `
}

const pageComponentCache = new Map()

function PageLoader(props) {
  return html`
    <${Dynamic}
      component=${() => {
        const pagePath = `${props.route.path}/page.js`
        if (!pageComponentCache.has(pagePath)) {
          pageComponentCache.set(
            pagePath,
            lazy(() => import(pagePath)),
          )
        }

        return pageComponentCache.get(pagePath)
      }}
    />
  `
}
