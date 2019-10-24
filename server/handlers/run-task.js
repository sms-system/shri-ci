const { bodyParser } = require('../helpers')
const RES_MSG = require('../res-messages')

const log = require('../providers/logger')

module.exports = app => async (res, req) => {
  const task = app.tasks[ req.getParameter(0) ]
  let body

  try {
    body = await bodyParser(res)

  } catch(err) {
    log(err)
    return res
      .writeStatus('400 Bad Request')
      .end(RES_MSG.PARSE_ERROR)
  }

  if (!task) {
    return res
      .writeStatus('404 Not Found')
      .end(RES_MSG.NOT_FOUND)
  }

  if (task.inProgress) {
    return res
      .writeStatus('409 Conflict')
      .end(RES_MSG.ALREADY_RUNNED)
  }

  if (!body.hash) {
    return res
      .writeStatus('422 Unprocessable Entity')
      .end(RES_MSG.INVALID_INPUT)
  }
  
  app.onNewTask({ ...task, hash: body.hash })
    
  res.end(RES_MSG.OK)
}