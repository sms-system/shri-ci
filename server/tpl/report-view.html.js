
// TODO!! // Implement websockets update

module.exports = ({ task, rec }) => (rec) ? `[ <a href="/">К списку задач</a> ] | [ <a href="/build/${task.id}">К списку отчетов о выполнении</a> ]
<hr>
            <b>Репозиторий:</b> ${task.repo}
<b>Хэш коммита / имя ветки:</b> ${rec.hash}
    <b>Дата и время старта:</b> ${rec.started}
 <b>Дата и время окончания:</b> ${rec.finished}
                 <b>Статус:</b> ${({ wait: 'В работе', success: 'Завершено успешно', error: 'Ошибка' })[rec.status]}

> Лог вывода:

<div class=textarea>${rec.stdout || ''}
</div>

> Лог ошибок:

<div class=textarea>${rec.stderr || ''}
</div>` : `404 Page Not Found`