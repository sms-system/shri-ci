const { bodyParser } = require('../helpers')
const RES_MSG = require('../res-messages')

const log = require('../providers/logger')

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

  const { name, image, repo, hash, cmd } = body

  app.addTask(name, image, repo, hash, cmd)
    
  res.end(RES_MSG.OK)
}