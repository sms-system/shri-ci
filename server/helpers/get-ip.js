// TODO!! Does not support proxy

module.exports = res => {
  const buf = res.getRemoteAddress()
  const str = new Uint8Array(buf).join('.')
  if (str.startsWith('0.0.0.0.0.0.0.0.0.0.255.255')) return str.substr(28)
  else if (str.startsWith('0.0.0.0.0.0.0.0.0.0.0.0.0')) return '127' + str.substr(25)
  throw new Error('Does not support ipv6')
}