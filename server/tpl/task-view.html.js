
const DEFAULTS = require('../config').get('defaults')
// TODO!! // Timestamps to human readable time

const statuses = {
  'empty': '?',
  'success': 'v',
  'error': 'x'
}

module.exports = ({
  task
}) => task ? `[ <a href="/">К списку задач</a> ]
<hr><script>

function run(id) {
  const hash = prompt('Укажите хэш коммита или название ветки', '${DEFAULTS.HASH}')
  if (hash) fetch('/run/'+id, {
    method: 'POST',
    body: JSON.stringify({ hash })
  })
}

</script>
<b>Задача:</b> ${task.name}

[ <a href="#" onclick="run(${task.id})">Запустить задачу</a> ]

<b>История запусков:</b>
<ol id="list">${[...task.history].reverse().map((job, i) => `<li><a href="/build/${task.id}/${task.history.length - i -1}">${job.started}</a> ( <span class="status-${job.status}">${statuses[job.status] || 'zZZ'}</span> )</li>`).join('')}</ol>

<script>

  const socket = new WebSocket("ws://localhost:8000/ws")
  const list = document.getElementById('list')

  socket.onmessage = (e) => {
    if (!list) { return }
    const msg = JSON.parse(e.data)
    switch (msg.subject) {
      case 'task-submited':
        { if (msg.id !== ${task.id}) { return }
        list.innerHTML = \`<li><a href="/build/${task.id}/\${list.children.length}">\${Date.now()}</a> ( <span class="status-wait">zZZ</span> )</li>\` + list.innerHTML
        break; }
      case 'task-finished':
        { let el = list.children[0]
        el.outerHTML = \`<li><a href="/build/${task.id}/\${list.children.length -1}">\${Date.now()}</a> ( <span class="status-\${msg.state}">\${(${JSON.stringify(statuses)})[msg.state]}</span> )</li>\`
        break; }
    }
  }
</script>
` : '404 Page Not Found'