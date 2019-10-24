const DEFAULTS = require('../config').get('defaults')
const QUEUE_OVERFLOW_SIZE = require('../config').get('opts').QUEUE_OVERFLOW_SIZE

const lastBuild = {
  'empty': '?',
  'success': 'v',
  'error': 'x',
}

// TODO !! Update overlimit banner on ws connections  

module.exports = ({
  tasks = [],
  agents = []
}) => {
  const queueTasksLength = tasks.filter(x => !x.active).length
  const agentsLength = agents.length
  return `[ <a href="/add_task">Добавить задачу</a> ]
<hr><script>

function run(id) {
  const hash = prompt('Укажите хэш коммита или название ветки', '${DEFAULTS.HASH}')
  if (hash) fetch('/run/'+id, {
    method: 'POST',
    body: JSON.stringify({ hash })
  })
}

</script>
${(queueTasksLength - agentsLength) >= QUEUE_OVERFLOW_SIZE ? `<div class="danger">!! Внимание, текущий пулл агентов не успевает справляться с очередью задач
   Количество активных агентов: <b>${agentsLength}</b> / Количество запланированных задач: <b>${queueTasksLength}</b>
</div>
`:``}<b>Задачи:</b><ol id=list data-count=${tasks.length}>${tasks.length? `${tasks.map(({ id, name, lastBuildState, active, inProgress }) => `<li data-id="${id}">( <span class="status-${lastBuildState}">${ lastBuild[lastBuildState] }</span> ) <a href="/build/${id}">${name}</a> ${inProgress?  (active? '( <span class="status-wait">...</span> )' : '( <span class="status-wait">zzZ</span> )') : `[ <a href="#" onclick="run(${id})">Перезапустить</a> ]`}</li>`).join('')}` : `
- Список пуст`}</ol>
<script>
  const socket = new WebSocket("ws://localhost:8000/ws")
  const list = document.getElementById('list')
  let isEmpty = list.dataset.count === '0'

  socket.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.subject) {
      case 'new-task':
        if (isEmpty) { list.innerText = ''; isEmpty = false }
        list.innerHTML = \`<li data-id="\${msg.id}">( <span class="status-wait">?</span> ) <a href="/build/\${msg.id}">\${msg.name}</a> ( <span class="status-wait">zzZ</span> )</li>\` + list.innerHTML
        break;
      case 'task-planned':
        { let el = [...list.children].filter(x => x.dataset.id === msg.id + '')[0]
        if (!el) {break}
        el.outerHTML = \`<li data-id="\${msg.id}">( <span class="status-\${msg.state}">\${(${JSON.stringify(lastBuild)})[msg.state]}</span> ) <a href="/build/\${msg.id}">\${msg.name}</a> ( <span class="status-wait">zzZ</span> )</li>\`
        break; }
      case 'task-submited':
        { let el = [...list.children].filter(x => x.dataset.id === msg.id + '')[0]
        if (!el) {break}
        el.outerHTML = \`<li data-id="\${msg.id}">( <span class="status-\${msg.state}">\${(${JSON.stringify(lastBuild)})[msg.state]}</span> ) <a href="/build/\${msg.id}">\${msg.name}</a> ( <span class="status-wait">...</span> )</li>\`
        break; }
      case 'task-finished':
        { let el = [...list.children].filter(x => x.dataset.id === msg.id + '')[0]
        if (!el) {break}
        el.outerHTML = \`<li data-id="\${msg.id}">( <span class="status-\${msg.state}">\${(${JSON.stringify(lastBuild)})[msg.state]}</span> ) <a href="/build/\${msg.id}">\${msg.name}</a> [ <a href="#" onclick="run(\${msg.id})">Перезапустить</a> ]</li>\`
        break; }
    }
  }
</script>`}