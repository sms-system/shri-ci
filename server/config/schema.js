module.exports = {
  port: {
    doc: 'The port to bind agent',
    format: 'port',
    default: 8000,
    arg: 'port',
    env: 'SERVER_PORT'
  },
  secret: {
    doc: 'Secret token',
    format: String,
    default: 's3kr3t',
    arg: 'secret',
    env: 'SECRET_TOKEN'
  },
  hostname: {
    doc: 'Server url',
    format: String,
    default: 'localhost:8000',
    arg: 'server',
    env: 'SERVER_URL'
  },
  opts: {
    QUEUE_OVERFLOW_SIZE: {
      doc: 'Maximum planned tasks without free agents',
      format: Number,
      default: 10,
      env: 'QUEUE_OVERFLOW_SIZE'
    },
    AGENT_CONNECT_ATTEMPTS_COUNT: {
      doc: 'Connect several times if agent does not responds',
      format: Number,
      default: 2,
      env: 'AGENT_CONNECT_ATTEMPTS_COUNT'
    },
    HEALTCHECK_INTERVAL: {
      doc: 'Healthcheck interval',
      format: Number,
      default: 1000,
      env: 'HEALTCHECK_INTERVAL'
    },
    RECONNECT_ON_HEALTCHECK_ATTEMPTS_COUNT: {
      doc: 'Reconnect on healthcheck fail',
      format: Number,
      default: 2,
      env: 'RECONNECT_ON_HEALTCHECK_ATTEMPTS_COUNT'
    },
    TASK_EXECUTION_TIMEOUT: {
      doc: 'Task execution timeout',
      format: Number,
      default: 0,
      env: 'TASK_EXECUTION_TIMEOUT'
    },
    RESTART_ON_TIMEOUT_ATTEMPTS_COUNT: {
      doc: 'Task will be failed if timeout will be reached several times',
      format: Number,
      default: 2,
      env: 'RESTART_ON_TIMEOUT_ATTEMPTS_COUNT'
    },
    REMOVE_DEAD_AGENTS:{
      doc: 'Remove agents that does not responds',
      format: Boolean,
      default: true,
      env: 'REMOVE_DEAD_AGENTS'
    }
  },
  defaults: {
    REPOSITORY: {
      doc: 'Default repository for prefilling in "Add task" form',
      format: String,
      default: '',
      env: 'DEFAULT_REPOSITORY'
    },
    HASH: {
      doc: 'Default commit hash or branch name for prefilling in "Add task" form',
      format: String,
      default: '',
      env: 'DEFAULT_HASH'
    },
    IMAGE: {
      doc: 'Default docker image for prefilling in "Add task" form',
      format: String,
      default: '',
      env: 'DEFAULT_IMAGE'
    }
  }
}