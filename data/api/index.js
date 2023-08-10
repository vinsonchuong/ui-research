import path from 'node:path'
import {compose, Logger} from 'passing-notes'
import serveWebSocket from 'passing-notes-websocket'
import serveUi from 'passing-notes-ui'
import {DataStore} from './data-store.js'

const currentDirectory = path.dirname(new URL(import.meta.url).pathname)
const uiPath = path.resolve(currentDirectory, '..', 'ui')

export const logger = new Logger()

const store = new DataStore({
  todoLists: [],
})

export default compose(
  serveWebSocket((ws) => {
    ws.on('message', ({type, params}) => {
      let ignoreUpdate = false

      if (type === 'subscribe') {
        store.subscribe((path, value) => {
          if (!ignoreUpdate) {
            ws.send(JSON.stringify({type: 'update', params: {path, value}}))
          }
        })
      } else if (type === 'update') {
        ignoreUpdate = true
        store.update(params.path, params.value)
        ignoreUpdate = false
      }
    })
  }),
  serveUi({
    path: uiPath,
    logger,
  }),
  () => () => ({status: 404}),
)
