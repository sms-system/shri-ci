const layout = require('../tpl/layout.html')
const body = require('../tpl/task-view.html')

module.exports = app => (res, req) => {
  const task = app.tasks[ req.getParameter(0) ]
  const page = layout(
    'История запуска',
    body({
      task
    })
  )
  res.end(page)
}