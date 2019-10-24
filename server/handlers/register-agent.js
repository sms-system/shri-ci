const { bodyParser, getIP } = require('../helpers')
const RES_MSG = require('../res-messages')

const log = require('../providers/logger')

module.exports = app => async (res) => {
  let ip, body

  try {
    ip = getIP(res)
    body = await bodyParser(res)
  } catch(err) {
    log(err)
    return res
      .writeStatus('400 Bad Request')
      .end(RES_MSG.PARSE_ERROR)
  }

  const { port, scheme } = body

  if ( ![ 'http', 'http' ].includes(scheme) || !parseInt(port) ) {
    return res
      .writeStatus('422 Unprocessable Entity')
      .end(RES_MSG.INVALID_INPUT)
  }

  try {
    app.registerAgent(ip, port, scheme)
  } catch(err) {
    return res
      .writeStatus('409 Conflict')
      .end(err)
  }
    
  res.end(RES_MSG.OK)
}