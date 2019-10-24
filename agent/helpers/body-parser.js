module.exports = (res) => new Promise((resolve, reject) => {
  let data = Buffer.alloc(0)

  res.onData((chunk, isLast) => {
    data = Buffer.concat([ data, Buffer.from(chunk) ])
    if (!isLast) { return }

    try {
      const json = JSON.parse(data)
      return resolve(json)
    } catch (e) {
      return reject(e)
    }
  })

  res.onAborted(reject)
})