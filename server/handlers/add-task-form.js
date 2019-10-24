const layout = require('../tpl/layout.html')
const body = require('../tpl/task-form.html')

module.exports = app => (res, req) => {
  const page = layout(
    'Новая задача',
    body()
  )
  res.end(page)
}