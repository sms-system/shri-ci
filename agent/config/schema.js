module.exports = {
  port: {
    doc: 'The port to bind agent',
    format: 'port',
    default: 8001,
    arg: 'port',
    env: 'AGENT_PORT'
  },
  secret: {
    doc: 'Secret token',
    format: String,
    default: 's3kr3t',
    arg: 'secret',
    env: 'SECRET_TOKEN'
  },
  server: {
    doc: 'Server url',
    format: String,
    default: 'http://localhost:8000',
    arg: 'server',
    env: 'SERVER_URL'
  },
  work_dir: {
    doc: 'Working directory for agent',
    format: String,
    default: '/data',
    arg: 'workdir',
    env: 'AGENT_WORKDIR'
  }
}