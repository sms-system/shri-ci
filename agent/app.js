const fs = require('fs')
const crypto = require('crypto')
const request = require('request')
const { exec } = require('child_process')
const config = require('./config')

const log = require('./providers/logger')

const SERVER_URL = config.get('server')
const SECRET = config.get('secret')
const PORT = config.get('port')
const WORKDIR = config.get('work_dir')

module.exports = class {
  connectToServer (url, port) {
    setInterval(() => {
      request.post(`${url}/notify_agent`, {
        json: { port, scheme: 'http' }
      }, (err, res, body) => {
        if (body === 'OK') {
          log('Connected to server')
        }
      })
    }, 3000)
  }

  startTask (id, image, repo, hash, cmd, nonceEnd) {

    const hmac = crypto.createHmac('sha512', SECRET)
    const sig = nonceEnd? hmac.update(nonceEnd).digest('hex') : ''

    // WARNING!!! TODO!!! // Many vulnerables (Rm -rf path injection, rce, xss etc...)
    // TODO!! // Callback hell
    exec(`rm -rf ${WORKDIR}/_${id} && mkdir -p ${WORKDIR}/_${id} && git clone ${repo} ${WORKDIR}/_${id}/repo`, { }, (err, stdout, stderr) => {
      if (err) {
        return request.post(`${SERVER_URL}/notify_build_result`, {
          json: { id, sig, port: PORT, state: err.code, stdout, stderr }
        })
      }
      try{
        fs.writeFileSync(`${WORKDIR}/_${id}/cmd`, cmd)
        fs.chmod(`${WORKDIR}/_${id}/cmd`, '777', () => {})
      } catch (e){
        console.log(e)
        return request.post(`${SERVER_URL}/notify_build_result`, {
          json: { id, sig, port: PORT, state: 1, stderr: 'Agent command saving internal problem!\n' + e }
        })
      }
      exec(`git checkout ${hash}`, { cwd: `${WORKDIR}/_${id}/repo` }, (err, stdout, stderr) => {
        if (err) {
          return request.post(`${SERVER_URL}/notify_build_result`, {
            json: { id, sig, port: PORT, state: err.code, stdout, stderr }
          })
        }
        // Horrible checks for `docker in docker` mode
        exec(`test=\`cat /proc/self/cgroup | grep "cpu:/" | sed 's/\\([0-9]\\):cpu:\\/docker\\///g'\`;docker run --init --rm \`[[ ! -z $test ]] && echo "--volumes-from=$test" || echo "-v ${WORKDIR}:/data"\` -w /data/_${id}/repo ${image} /data/_${id}/cmd`, { }, (err, stdout, stderr) => {
          // console.log('DEBUG', { id, sig, port: PORT, state: err ? err.code : 0, stdout, stderr })
          return request.post(`${SERVER_URL}/notify_build_result`, {
            json: { id, sig, port: PORT, state: err ? err.code : 0, stdout, stderr }
          })
        })
      })
    })
  }
}