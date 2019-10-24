const request = require('request-promise')
const crypto = require('crypto')
const config = require('./config')

const log = require('./providers/logger')

const SECRET = config.get('secret')
const AGENT_CONNECT_ATTEMPTS_COUNT = config.get('opts').AGENT_CONNECT_ATTEMPTS_COUNT
const HEALTCHECK_INTERVAL = config.get('opts').HEALTCHECK_INTERVAL
const RECONNECT_ON_HEALTCHECK_ATTEMPTS_COUNT = config.get('opts').RECONNECT_ON_HEALTCHECK_ATTEMPTS_COUNT
const TASK_EXECUTION_TIMEOUT = config.get('opts').TASK_EXECUTION_TIMEOUT

// TODO!! // Not implemented yet (will restart infinitly)
const RESTART_ON_TIMEOUT_ATTEMPTS_COUNT = config.get('opts').RESTART_ON_TIMEOUT_ATTEMPTS_COUNT

const REMOVE_DEAD_AGENTS = config.get('opts').REMOVE_DEAD_AGENTS

module.exports = class {
  ws = null
  tasksIdQueue = []
  freeAgents = []
  agents = {}
  tasks = {}
  taskSequenceIndex = 0

  constructor () {
    // Healthcheck
    setInterval(() => {
      Object.keys(this.agents).forEach((id) => {
        const agent = this.agents[id]
        if (!REMOVE_DEAD_AGENTS && !agent.task) { return }
        request
          .get(`${agent.scheme}://${id}/ping`)
          .then(() => agent.failedChecks = 0)
          .catch(err => {
            agent.failedChecks++
            log(`Agent ${id} does not respond on healthcheck`)
            if (++agent.failedChecks > RECONNECT_ON_HEALTCHECK_ATTEMPTS_COUNT) {
              log(`Agent ${id} looks like dead`)
              const taskId = agent.task && agent.task.id
              if (REMOVE_DEAD_AGENTS) {
                this.freeAgents = this.freeAgents.filter(x => `${x.ip}:${x.port}` !== id)
                delete this.agents[id]
                log(`Agent ${id} removed`)
              }
              if (taskId) this.onNewTask(this.tasks[taskId])
              delete agent.task
            }
          })
      })
    }, HEALTCHECK_INTERVAL)
  }

  registerAgent (ip, port, scheme) {
    const id = `${ip}:${port}`
    if (this.agents[id]) { throw 'ALREADY_REGISTERED' }
    this.agents[id] = {
      failedChecks: 0,
      scheme
    }
    this.onNewAgent({ ip, port, scheme })
  }

  addTask (name, image, repo, hash, cmd) {
    const id = this.taskSequenceIndex++
    const task = {
      id,
      name,
      image,
      repo,
      cmd,
      hash,
      history: [],
      active: false,
      lastBuildState: 'empty'
    }
    this.notify('new-task', { id, name })
    this.tasks[id] = task
    this.onNewTask({ ...task, hash })
  }

  async submitJobToAgent (task, agent) {
    const nonceStart = (Math.random() * 10e16 + Date.now()).toString()
    const nonceEnd = (Math.random() * 10e16 + Date.now()).toString()
    const hmac1 = crypto.createHmac('sha512', SECRET)
    const sigStart = hmac1.update(nonceStart).digest('hex')

    const taskBody = {
      ...task,
      nonceStart,
      nonceEnd
    }

    for (let i=AGENT_CONNECT_ATTEMPTS_COUNT; i--; i>= 0) {
      try {
        const body = await request.post(`${agent.scheme}://${agent.ip}:${agent.port}/build`, {
          json: taskBody
        })

        if ( body !== sigStart ) {
          log(`Security check for agent ${agent.ip}:${agent.port} failed`)
          break
        }

        const hmac2 = crypto.createHmac('sha512', SECRET)
        const sigEnd = hmac2.update(nonceEnd).digest('hex')
        this.agents[`${agent.ip}:${agent.port}`].task = {
          sigEnd,
          started: Date.now(),
          id: task.id,
          hash: task.hash,
          timer: TASK_EXECUTION_TIMEOUT > 0 ? setTimeout(() => {
            log(`Task #${task.id} execution timeout`)
            this.onNewTask(this.tasks[task.id])
            if (this.agents[`${agent.ip}:${agent.port}`]) {
              delete this.agents[`${agent.ip}:${agent.port}`].task
            }
          }, TASK_EXECUTION_TIMEOUT) : null
        }
        if (!this.tasks[task.id].active) {
          this.tasks[task.id].active = true
          this.tasks[task.id].history.push({
            started: Date.now(),
            finished: '-',
            hash: task.hash,
            status: 'wait'
          })
          this.notify('task-submited', { id: task.id, name: task.name, state: task.lastBuildState })
        }
        log(`Task #${task.id} submited to agent ${agent.ip}:${agent.port}`)
        return

      } catch (err) {
        //  log(err)

      }
    }
    if (REMOVE_DEAD_AGENTS) {
      const id = `${agent.ip}:${agent.port}`
      this.freeAgents = this.freeAgents.filter(x => `${x.ip}:${x.port}` !== id)
      delete this.agents[id]
      log(`Agent ${id} removed`)
    }

    throw 'CAN_NOT_SUBMIT'
  }

  onNewAgent (agent) {
    // this.notify('agents-updated', { count: Object.keys(this.agents).length })
    if (this.tasksIdQueue.length) {
      const task = this.tasks[ this.tasksIdQueue.shift() ]

      this.submitJobToAgent(task, agent).catch(() => {
        this.onNewTask(task)
      })
    } else {
      this.freeAgents.push(agent)
    }
  }

  onNewTask (task) {
    if (!task.active) {
      this.notify('task-planned', { id: task.id, name: task.name, state: task.lastBuildState })
    }
    this.tasks[task.id].inProgress = true
    if (this.freeAgents.length) {
      const agent = this.freeAgents.pop()

      this.submitJobToAgent(task, agent).catch(() => {
        this.onNewTask(task)
      })
    } else {
      this.tasksIdQueue.push(task.id)
    }
  }

  notify (msg, data) {
    if (this.ws) { try {
      this.ws.send(JSON.stringify({ subject: msg, ...data }))
    } catch (err) {} }
  }
}