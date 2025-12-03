const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const { tests, getTest } = require('./testsConfig');
const dataStore = require('./dataStore');

const PORT = process.env.PORT || 3000;

function renderLayout(title, content) {
  const head = `<!DOCTYPE html>
  <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <link rel="stylesheet" href="/public/styles.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body>
      <header class="top-bar">
        <div class="brand">
          <div class="brand-mark">AI</div>
          <div>
            <div class="brand-title">ai-mad</div>
            <div class="brand-sub">психологическое тестирование</div>
          </div>
        </div>
        <nav class="top-nav">
          <a href="/">Главная</a>
        </nav>
      </header>
      <main class="page">${content}</main>
      <footer class="footer">ai-mad.ru · конфиденциальная платформа оценки личности</footer>
    </body>
  </html>`;
  return head;
}

function serveStatic(filePath, res) {
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  const contentType = mimeTypes[ext] || 'text/plain';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('Not found');
  }
}

function parseFormData(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      resolve(querystring.parse(body));
    });
    req.on('error', reject);
  });
}

function renderHome() {
  const items = tests
    .map(
      (test) => `<article class="card">
      <div class="card-header">
        <div>
          <div class="badge">${test.name}</div>
          <p class="muted">${test.description}</p>
        </div>
      </div>
      <div class="card-actions">
        <a class="button primary" href="/tests/${test.slug}/assessment">Пройти тест</a>
      </div>
    </article>`
    )
    .join('');

  const content = `<section class="hero">
      <div>
        <p class="eyebrow">конфиденциальное тестирование</p>
        <h1>Психологическая диагностика<br/>для команды ai-mad</h1>
        <p class="lead">Перед началом участник вводит персональные данные, после чего сразу переходит к вопросам. Итоги доступны только специалистам по закрытой ссылке /results.</p>
      </div>
      <div class="hero-panel">
        <p>Выберите методику, чтобы начать процедуру.</p>
        <ul>
          <li>Ввод персональных данных перед началом</li>
          <li>Стандартизированные вопросы с балльной оценкой</li>
          <li>Сводная таблица результатов для специалистов</li>
        </ul>
      </div>
    </section>
    <section class="grid">${items}</section>`;
  return renderLayout('ai-mad.ru — тестирование', content);
}

function renderAssessment(test, record, message) {
  const warning = record
    ? ''
    : `<div class="alert">Для персонализации результатов сначала заполните данные участника — сразу после этого откроются вопросы.</div>`;

  const personSection = record
    ? `<div class="person-card">
        <div>
          <div class="badge">${record.person.fullName || 'Участник без ФИО'}</div>
          <p class="muted">Email: ${record.person.email || '—'} · Телефон: ${record.person.phone || '—'}</p>
        </div>
        <div class="muted">Создано: ${new Date(record.createdAt).toLocaleString('ru-RU')}</div>
      </div>`
    : `<form method="POST" action="/tests/${test.slug}/assessment" class="form-grid">
        <label>ФИО<input required name="fullName" placeholder="Иванов Иван"/></label>
        <label>Email<input type="email" name="email" placeholder="example@domain.ru"/></label>
        <label>Телефон<input name="phone" placeholder="+7 (___) ___-__-__"/></label>
        <label>Возраст<input name="age" type="number" min="12" max="99" placeholder="28"/></label>
        <label>Пол<select name="gender">
          <option value="">Не выбран</option>
          <option value="female">Женский</option>
          <option value="male">Мужской</option>
          <option value="other">Другое</option>
        </select></label>
        <label class="span-2">Комментарий/пожелания<textarea name="notes" rows="3" placeholder="Дополнительная информация для специалиста"></textarea></label>
        <div class="form-actions span-2">
          <button class="button primary" type="submit">Сохранить данные и начать тест</button>
          <a class="button ghost" href="/">Назад</a>
        </div>
      </form>`;
  const questionsMarkup = test.questions
    .map(
      (question, index) => `<div class="question">
        <div class="question-header">
          <span class="badge neutral">Вопрос ${index + 1}</span>
          <p>${question.text}</p>
        </div>
        <div class="options">
          ${[1, 2, 3, 4, 5]
            .map(
              (value) => `<label class="option"><input type="radio" name="${question.id}" value="${value}" required ${
                record ? '' : 'disabled'
              }/><span>${value} ${value === 1 ? '— совершенно не согласен' : value === 5 ? '— полностью согласен' : ''}</span></label>`
            )
            .join('')}
        </div>
      </div>`
    )
    .join('');

  const content = `<section class="panel">
      <p class="eyebrow">${test.name}</p>
      <h2>Персональные данные и тестирование</h2>
      <p class="muted">Сначала заполните персональные данные, затем ответьте на утверждения по шкале от 1 до 5. Результаты сохраняются и доступны специалисту по закрытой ссылке /results.</p>
      ${warning}
      ${personSection}
      <form method="POST" action="/tests/${test.slug}/assessment" class="question-list">
        <input type="hidden" name="recordId" value="${record ? record.id : ''}" />
        ${questionsMarkup}
        <div class="form-actions">
          <button class="button primary" type="submit" ${record ? '' : 'disabled'}>Завершить тест</button>
        </div>
        ${message ? `<p class="muted">${message}</p>` : ''}
      </form>
    </section>`;
  return renderLayout(`${test.name} — тест`, content);
}

function calculateScores(test, answers) {
  const scores = {};
  test.scales.forEach((scale) => {
    scores[scale.key] = { raw: 0, count: 0 };
  });

  Object.entries(answers).forEach(([questionId, value]) => {
    const question = test.questions.find((q) => q.id === questionId);
    if (!question) return;
    Object.entries(question.scaleWeights).forEach(([scaleKey, weight]) => {
      if (!scores[scaleKey]) {
        scores[scaleKey] = { raw: 0, count: 0 };
      }
      scores[scaleKey].raw += Number(value) * weight;
      scores[scaleKey].count += Math.abs(weight);
    });
  });

  const summarized = {};
  Object.entries(scores).forEach(([key, data]) => {
    const normalized = data.count ? Math.round((data.raw / data.count) * 10) / 10 : 0;
    summarized[key] = { raw: data.raw, normalized };
  });
  return summarized;
}

function renderComplete(test, record) {
  const rows = test.scales
    .map((scale) => {
      const metrics = record.scores[scale.key] || { raw: 0, normalized: 0 };
      return `<tr><td>${scale.label}</td><td>${metrics.raw}</td><td>${metrics.normalized}</td><td>${scale.detail}</td></tr>`;
    })
    .join('');
  const content = `<section class="panel">
      <p class="eyebrow">${test.name}</p>
      <h2>Результаты тестирования</h2>
      <div class="person-card">
        <div>
          <div class="badge">${record.person.fullName || 'Участник без ФИО'}</div>
          <p class="muted">Email: ${record.person.email || '—'} · Телефон: ${record.person.phone || '—'}</p>
        </div>
        <div class="muted">Дата: ${new Date(record.finishedAt).toLocaleString('ru-RU')}</div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Шкала</th><th>Сырой балл</th><th>Норм.</th><th>Пояснение</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="muted">Комментарий участника: ${record.person.notes || '—'}</p>
      <div class="form-actions">
        <a class="button ghost" href="/">На главную</a>
        <a class="button ghost" href="/tests/${test.slug}/results">Таблица результатов</a>
      </div>
    </section>`;
  return renderLayout(`${test.name} — результаты`, content);
}

function renderResults(test, records) {
  const rows = records
    .map(
      (record) => `<tr>
        <td>${record.person.fullName || '—'}</td>
        <td>${record.person.email || '—'}</td>
        <td>${record.person.phone || '—'}</td>
        <td>${record.person.age || '—'}</td>
        <td>${new Date(record.finishedAt).toLocaleString('ru-RU')}</td>
        <td><a class="button ghost" href="/tests/${test.slug}/results/${record.id}">Открыть результаты</a></td>
      </tr>`
    )
    .join('');

  const highlight = records.length
    ? ''
    : '<div class="alert">Пока нет завершенных протоколов. Поделитесь ссылкой на заполнение данных и прохождение теста.</div>';

  const content = `<section class="panel">
      <p class="eyebrow">${test.name}</p>
      <h2>Сводная таблица результатов</h2>
      <p class="muted">Ссылка конфиденциальна: /tests/${test.slug}/results. Не передавайте её участникам.</p>
      ${highlight}
      <div class="table-wrapper">
        <table>
          <thead><tr><th>ФИО</th><th>Email</th><th>Телефон</th><th>Возраст</th><th>Завершено</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
  return renderLayout(`${test.name} — сводные результаты`, content);
}

function handleNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(renderLayout('Страница не найдена', '<section class="panel"><h2>Страница не найдена</h2><p class="muted">Проверьте ссылку или вернитесь на главную.</p></section>'));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname);
    return serveStatic(filePath, res);
  }

  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderHome());
    return;
  }

  const intakeMatch = pathname.match(/^\/tests\/([^/]+)\/intake$/);
  if (intakeMatch) {
    const slug = intakeMatch[1];
    const test = getTest(slug);
    if (!test) return handleNotFound(res);
    if (req.method === 'GET') {
      res.writeHead(302, { Location: `/tests/${slug}/assessment` });
      return;
    }
    if (req.method === 'POST') {
      const body = await parseFormData(req);
      const record = dataStore.createRecord(slug, body);
      res.writeHead(302, { Location: `/tests/${slug}/assessment?id=${record.id}` });
      res.end();
      return;
    }
  }

  const assessmentMatch = pathname.match(/^\/tests\/([^/]+)\/assessment$/);
  if (assessmentMatch) {
    const slug = assessmentMatch[1];
    const test = getTest(slug);
    if (!test) return handleNotFound(res);
    if (req.method === 'GET') {
      const record = parsedUrl.query.id ? dataStore.getRecord(parsedUrl.query.id) : null;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(renderAssessment(test, record, parsedUrl.query.id ? '' : 'Сначала заполните форму с персональными данными, чтобы перейти к вопросам.'));
      return;
    }
    if (req.method === 'POST') {
      const body = await parseFormData(req);
      if (!body.recordId) {
        const record = dataStore.createRecord(slug, body);
        res.writeHead(302, { Location: `/tests/${slug}/assessment?id=${record.id}` });
        res.end();
        return;
      }
      const record = dataStore.getRecord(body.recordId);
      if (!record) {
        res.writeHead(302, { Location: `/tests/${slug}/assessment` });
        res.end();
        return;
      }
      const answers = {};
      test.questions.forEach((q) => {
        if (body[q.id]) {
          answers[q.id] = Number(body[q.id]);
        }
      });
      const scores = calculateScores(test, answers);
      const updated = dataStore.updateRecord(record.id, {
        answers,
        scores,
        finishedAt: new Date().toISOString(),
        status: 'complete'
      });
      res.writeHead(302, { Location: `/tests/${slug}/complete?id=${updated.id}` });
      res.end();
      return;
    }
  }

  const completeMatch = pathname.match(/^\/tests\/([^/]+)\/complete$/);
  if (completeMatch && req.method === 'GET') {
    const slug = completeMatch[1];
    const test = getTest(slug);
    if (!test) return handleNotFound(res);
    const record = parsedUrl.query.id ? dataStore.getRecord(parsedUrl.query.id) : null;
    if (!record) return handleNotFound(res);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderComplete(test, record));
    return;
  }

  const resultsMatch = pathname.match(/^\/tests\/([^/]+)\/results$/);
  if (resultsMatch && req.method === 'GET') {
    const slug = resultsMatch[1];
    const test = getTest(slug);
    if (!test) return handleNotFound(res);
    const records = dataStore.listRecordsByTest(slug);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderResults(test, records));
    return;
  }

  const detailMatch = pathname.match(/^\/tests\/([^/]+)\/results\/([a-zA-Z0-9-]+)$/);
  if (detailMatch && req.method === 'GET') {
    const slug = detailMatch[1];
    const id = detailMatch[2];
    const test = getTest(slug);
    if (!test) return handleNotFound(res);
    const record = dataStore.getRecord(id);
    if (!record || record.testSlug !== slug) return handleNotFound(res);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderComplete(test, record));
    return;
  }

  handleNotFound(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
