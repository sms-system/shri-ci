const DEFAULTS = require('../config').get('defaults')

module.exports = () => `[ <a href="/">К списку задач</a> ]
<hr><script>
function save () {
  const name = document.getElementById('name').value
  const repo = document.getElementById('repo').value
  const hash = document.getElementById('hash').value
  const image = document.getElementById('image').value
  const cmd = document.getElementById('cmd').value
  if (!name || !repo || !hash || !image || !cmd) { 
    alert('Не все поля заполнены'); return }
  fetch('/add_task', {
    method: 'POST',
    body: JSON.stringify({ name, repo, hash, image, cmd })
  }).then(data => data.text()).then(res => {
    if (res === 'OK') {
      window.location.href = '/'
    } else {
      console.log(res)
      alert('Ошибка при сохранении');
    }
  })
}
</script>
<form action="action">
<label for="name">                Название:</label> <input name="name" id="name"></input>

<label for="image">     Docker образ задачи:</label> <input name="image" id="image" value="${DEFAULTS.IMAGE}"></input>

<label for="repo">             Репозиторий:</label> <input name="repo" id="repo" value="${DEFAULTS.REPOSITORY}"></input>

<label for="hash">   Хэш коммита или ветка:</label> <input name="hash" id="hash" value="${DEFAULTS.HASH}"></input>

<label for="cmd">                  Скрипт:</label>
                          <textarea name="cmd" id="cmd" rows="16">
#!/bin/sh

</textarea>

[ <a href="#" onclick="save()">Сохранить</a> ]
</form>`