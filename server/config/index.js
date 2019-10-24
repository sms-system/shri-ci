const convict = require('convict')

const schema = require('./schema.js')
const config = convict(schema)

module.exports = config