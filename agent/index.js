const { App } = require('uWebSockets.js')
const CIAgent = require('./app')
const config = require('./config')
const PORT = config.get('port')

const log = require('./providers/logger')

const server = new App()
const app = new CIAgent()

const taskListHandler = require('./handlers/build')
const pingHandler = require('./handlers/ping')

app.connectToServer(config.get('server'), PORT)

server
  .get('/ping', pingHandler(app))
  .post('/build', taskListHandler(app))

  .listen(PORT, () => {
    log(`Web server started on ${PORT}`)
  })