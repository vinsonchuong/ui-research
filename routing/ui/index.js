import {sendRequest} from 'passing-notes'
import {Renderer} from '../../lib/view/index.js'
import Router from './router.js'
import App from './app.js'

const response = await sendRequest({method: 'GET', url: '/routes'})
const routes = JSON.parse(response.body)

const router = new Router(routes)
router.subscribe((route) => {
  console.log(route)
})

const renderer = new Renderer(document.body)
renderer.render(App, {router})
