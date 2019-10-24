const crypto = require('crypto')
const bodyParser = require('../helpers/body-parser')
const RES_MSG = require('../res-messages')
const config = require('../config')

const log = require('../providers/logger')

const SECRET = config.get('secret')

module.exports = app => async (res) => {
  let body

  try {
    body = await bodyParser(res)

  } catch(err) {
    log(err)
    return res
      .writeStatus('400 Bad Request')
      .end(RES_MSG.PARSE_ERROR)
  }

  const { nonceStart, nonceEnd, id, image, repo, hash, cmd } = body
  const hmac = crypto.createHmac('sha512', SECRET)
  const sig = nonceStart? hmac.update(nonceStart).digest('hex') : ''

  log(`Received task #${id}`)
  app.startTask(id, image, repo, hash, cmd, nonceEnd)

  res.end(sig)
}