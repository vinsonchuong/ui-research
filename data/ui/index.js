import {fromWebSocket, pipe, map, consume} from 'heliograph'
import {Renderer} from '../../lib/view/index.js'
import DataStore from '../api/data-store.js'
import App from './app.js'

const store = new DataStore({
  todoLists: [],
})

pipe(
  await fromWebSocket(`ws://${window.location.host}`),
  map(JSON.parse),
  consume(({type, params}) => {
    if (type === 'update') {
      store.update(params.path, params.value)
    } else {
      console.log('Unknown event', type, params)
    }
  }),
)

const renderer = new Renderer(document.body)
renderer.render(App, {})
