import path from 'node:path'
import {promises as fs} from 'node:fs'
import {globby} from 'globby'
import flowRight from 'lodash/flowRight.js'

export default function ({path: uiPath}) {
  return flowRight(
    (next) => async (request) => {
      const response = await next(request)
      return response.status === 404 &&
        request.headers['sec-fetch-dest'] === 'document'
        ? next({...request, url: '/'})
        : response
    },
    (next) => async (request) => {
      if (request.url === '/routes') {
        const routeFilePaths = await globby(
          path.join(uiPath, 'pages/*/route.json'),
        )
        const routes = await Promise.all(
          routeFilePaths.map(async (filePath) => {
            const routeDirectory = path.dirname(path.relative(uiPath, filePath))
            const routeName = path.basename(routeDirectory)

            return {
              name: routeName,
              path: `/${routeDirectory}`,
              ...JSON.parse(await fs.readFile(filePath, 'utf8')),
            }
          }),
        )

        return {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(routes),
        }
      }

      return next(request)
    },
  )
}
