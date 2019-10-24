const { bodyParser, getIP } = require('../helpers')
const RES_MSG = require('../res-messages')

const log = require('../providers/logger')

module.exports = app => async (res) => {
  let ip, body

  try {
    ip = getIP(res)
    body = await bodyParser(res)

  } catch(err) {
    log(body, err)
    return res
      .writeStatus('400 Bad Request')
      .end(RES_MSG.PARSE_ERROR)
  }

  const { port, sig, id, state, stdout, stderr } = body
  
  // !!! Suspicion for BUG
  const agent = app.agents[`${ip}:${port}`]
  // log('DEBUG:', `${ip}:${port}`)

  if (!agent || !agent.task || agent.task.sigEnd !== sig || agent.task.id !== id) {
    log(agent, body)
    log('Rejected invalid task result submission')
    return res
      .writeStatus('403 Forbidden')
      .end(RES_MSG.REJECTED)
  }

  const job = agent.task
  clearTimeout(job.timer)
  delete agent.task

  const task = app.tasks[job.id]
  task.lastBuildState = state === 0 ? 'success' : 'error'
  task.active = false
  task.inProgress = false
  const current = task.history[task.history.length - 1]
  current.finished = Date.now()
  current.stderr = stderr
  current.stdout = stdout
  current.status = state === 0 ? 'success' : 'error'

  log(`Task #${task.id} finished`)
  app.notify('task-finished', { id: job.id, name: task.name, state: state === 0 ? 'success' : 'error' })

  app.onNewAgent({ ip, port, scheme: agent.scheme })

  res.end(RES_MSG.OK)
}