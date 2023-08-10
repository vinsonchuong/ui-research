import path from 'node:path'
import {compose, Logger} from 'passing-notes'
import serveUi from 'passing-notes-ui'
import serveUiRoutes from './serve-ui-routes.js'

const currentDirectory = path.dirname(new URL(import.meta.url).pathname)
const uiPath = path.resolve(currentDirectory, '..', 'ui')

export const logger = new Logger()

export default compose(
  serveUiRoutes({path: uiPath}),
  serveUi({
    path: uiPath,
    logger,
  }),
  () => () => ({status: 404}),
)
