const layout = require('../tpl/layout.html')
const body = require('../tpl/report-view.html')

module.exports = app => (res, req) => {
  const task = app.tasks[ req.getParameter(0) ]
  const rec = task && task.history[ req.getParameter(1) ]
  const page = layout(
    'Отчет выполнения',
    body({ task, rec })
  )
  res.end(page)
}