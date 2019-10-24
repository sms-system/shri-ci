const RES_MSG = require('../res-messages')

module.exports = app => (res) => {
  res.end(RES_MSG.OK)
}