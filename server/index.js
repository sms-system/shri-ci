const fs = require('fs')
const { App } = require('uWebSockets.js')
const CIServer = require('./app')
const config = require('./config')

const log = require('./providers/logger')

const PORT = config.get('port')

const server = new App()
const app = new CIServer()

const mainCss = fs.readFileSync('./assets/main.css', 'utf8')

const taskListHandler = require('./handlers/get-tasks-list')
const buildViewHandler = require('./handlers/get-build-view')
const reportViewHandler = require('./handlers/get-report-view')
const addTaskHandler = require('./handlers/add-task')
const addTaskFormHandler = require('./handlers/add-task-form')
const registerAgentHandler = require('./handlers/register-agent')
const notifyBuildResultHandler = require('./handlers/notify-build-result')
const runTaskHandler = require('./handlers/run-task')

server
  .get('/main.css', res => res.end(mainCss))

  .ws('/ws', { open (ws) { app.ws = ws } })

  .get('/', taskListHandler(app))
  .get('/build/:id', buildViewHandler(app))
  .get('/build/:id/:run_id', reportViewHandler(app))
  .post('/run/:id', runTaskHandler(app))
  .get('/add_task', addTaskFormHandler(app))
  .post('/add_task', addTaskHandler(app))
  .post('/notify_agent', registerAgentHandler(app))
  .post('/notify_build_result', notifyBuildResultHandler(app))

  .listen(PORT, () => {
    log(`Web server started on ${PORT}`)
  })