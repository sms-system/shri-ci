const layout = require('../tpl/layout.html')
const body = require('../tpl/tasks-list.html')

module.exports = app => (res, req) => {
  const page = layout(
    'Список задач',
    body({
      tasks: Object.values(app.tasks).reverse(),
      agents: Object.keys(app.agents)
    })
  )
  res.end(page)
}