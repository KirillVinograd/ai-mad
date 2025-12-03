const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { listTests, getTestBySlug } = require('./configs');
const dataStore = require('./dataStore');
const { buildResult } = require('./lib/testEngine');

const PORT = process.env.PORT || 3000;

function renderLayout(title, content) {
  return `<!DOCTYPE html>
  <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <link rel="stylesheet" href="/public/styles.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
      <script src="/public/js/app.js" defer></script>
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
}

function serveStatic(filePath, res) {
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
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

function parseJsonBody(req) {
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
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function renderHome() {
  const tests = listTests();
  const items = tests
    .map(
      (test) => `<article class="card">
        <div class="card-header compact">
          <div>
            <h3>${test.meta.name}</h3>
            <p class="muted small">${test.meta.description}</p>
          </div>
        </div>
        <div class="card-actions">
          <a class="button primary" href="/tests/${test.slug}/assessment">Запустить</a>
        </div>
      </article>`
    )
    .join('');

  const content = `<section class="section-title" id="tests">
      <div>
        <h1>Линейка методик</h1>
        <p class="muted">Запустите нужную методику и получите протокол без лишних экранов.</p>
      </div>
    </section>
    <section class="grid minimal-grid">${items}</section>`;
  return renderLayout('ai-mad.ru — тестирование', content);
}

function renderAssessmentPage(test) {
  const content = `<section class="panel" id="test-root" data-test-slug="${test.slug}">
      <p class="eyebrow">${test.meta.name}</p>
      <h2>Персональные данные и прохождение</h2>
      <p class="muted">Сначала заполните анкету участника, затем переходите к вопросам. Интерфейс адаптирован к новым цветам и лучше подходит для фокусированной работы.</p>
      <div class="test-shell">
        <div class="intake"></div>
        <div class="assessment hidden"></div>
        <div class="results hidden"></div>
      </div>
    </section>`;
  return renderLayout(`${test.meta.name} — анкетирование`, content);
}

function renderResultsPage(test, records) {
  const rows = records
    .map(
      (record) => `<tr>
        <td>${record.person?.fullName || '—'}</td>
        <td>${record.person?.email || '—'}</td>
        <td>${record.person?.age || '—'}</td>
        <td>${new Date(record.finishedAt).toLocaleString('ru-RU')}</td>
        <td><a class="button ghost" href="/tests/${test.slug}/results/${record.id}">Открыть</a></td>
      </tr>`
    )
    .join('');
  const highlight = records.length
    ? ''
    : '<div class="alert">Пока нет завершенных протоколов. Поделитесь ссылкой на заполнение данных и прохождение теста.</div>';

  const content = `<section class="panel">
      <p class="eyebrow">${test.meta.name}</p>
      <h2>Сводная таблица результатов</h2>
      ${highlight}
      <div class="table-wrapper">
        <table>
          <thead><tr><th>ФИО</th><th>Email</th><th>Возраст</th><th>Завершено</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
  return renderLayout(`${test.meta.name} — сводные результаты`, content);
}

function renderResultDetail(test, record) {
  const scalesRows = (record.result?.scales || [])
    .map(
      (scale) => `<tr>
        <td>${scale.name}</td>
        <td>${scale.raw_score}</td>
        <td>${scale.normalized}</td>
        <td>${scale.level || '—'}</td>
      </tr>`
    )
    .join('');
  const content = `<section class="panel">
      <p class="eyebrow">${test.meta.name}</p>
      <h2>Результаты</h2>
      <div class="person-card">
        <div>
          <div class="badge">${record.person?.fullName || 'Участник'}</div>
          <p class="muted">Email: ${record.person?.email || '—'} · Телефон: ${record.person?.phone || '—'}</p>
          <p class="muted">Возраст: ${record.person?.age || '—'} · Пол: ${record.person?.gender || '—'}</p>
        </div>
        <div class="muted">Дата: ${new Date(record.finishedAt).toLocaleString('ru-RU')}</div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Шкала</th><th>Сырой балл</th><th>Норм.</th><th>Уровень</th></tr></thead>
          <tbody>${scalesRows}</tbody>
        </table>
      </div>
      <p class="muted">${record.result?.summary_text || 'Резюме сформируется автоматически после прохождения.'}</p>
      <div class="form-actions">
        <a class="button ghost" href="/">На главную</a>
      </div>
    </section>`;
  return renderLayout(`${test.meta.name} — результаты`, content);
}

function handleNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(
    renderLayout(
      'Страница не найдена',
      '<section class="panel"><h2>Страница не найдена</h2><p class="muted">Проверьте ссылку или вернитесь на главную.</p></section>'
    )
  );
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/tests' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tests: listTests() }));
    return true;
  }

  const testMatch = pathname.match(/^\/api\/tests\/([^/]+)$/);
  if (testMatch && req.method === 'GET') {
    const slug = testMatch[1];
    const test = getTestBySlug(slug);
    if (!test) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
      return true;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(test));
    return true;
  }

  const sessionCreate = pathname.match(/^\/api\/tests\/([^/]+)\/sessions$/);
  if (sessionCreate && req.method === 'POST') {
    try {
      const slug = sessionCreate[1];
      if (!getTestBySlug(slug)) throw new Error('Методика не найдена');
      const body = await parseJsonBody(req);
      const record = dataStore.startSession(slug, body.person || {});
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ session_id: record.id, started_at: record.startedAt }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return true;
  }

  const sessionSubmit = pathname.match(/^\/api\/tests\/([^/]+)\/sessions\/([a-zA-Z0-9-]+)\/answers$/);
  if (sessionSubmit && req.method === 'POST') {
    try {
      const slug = sessionSubmit[1];
      const id = sessionSubmit[2];
      const record = dataStore.getRecord(id);
      if (!record || record.testSlug !== slug) throw new Error('Сессия не найдена');
      const body = await parseJsonBody(req);
      const result = buildResult(slug, id, body.answers || {}, record.startedAt);
      const updated = dataStore.updateRecord(id, {
        answers: result.answers,
        result,
        status: 'complete',
        finishedAt: result.finished_at
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated.result));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return true;
  }

  const sessionGet = pathname.match(/^\/api\/tests\/([^/]+)\/sessions\/([a-zA-Z0-9-]+)$/);
  if (sessionGet && req.method === 'GET') {
    const slug = sessionGet[1];
    const id = sessionGet[2];
    const record = dataStore.getRecord(id);
    if (!record || record.testSlug !== slug) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
      return true;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(record));
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname.replace('/public', 'public'));
    return serveStatic(filePath, res);
  }

  if (pathname.startsWith('/api/')) {
    const handled = await handleApi(req, res, pathname);
    if (handled) return;
  }

  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderHome());
    return;
  }

  const assessmentMatch = pathname.match(/^\/tests\/([^/]+)\/assessment$/);
  if (assessmentMatch && req.method === 'GET') {
    const slug = assessmentMatch[1];
    const test = getTestBySlug(slug);
    if (!test) return handleNotFound(res);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderAssessmentPage(test));
    return;
  }

  const resultsMatch = pathname.match(/^\/tests\/([^/]+)\/results$/);
  if (resultsMatch && req.method === 'GET') {
    const slug = resultsMatch[1];
    const test = getTestBySlug(slug);
    if (!test) return handleNotFound(res);
    const records = dataStore.listRecordsByTest(slug);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderResultsPage(test, records));
    return;
  }

  const detailMatch = pathname.match(/^\/tests\/([^/]+)\/results\/([a-zA-Z0-9-]+)$/);
  if (detailMatch && req.method === 'GET') {
    const slug = detailMatch[1];
    const id = detailMatch[2];
    const test = getTestBySlug(slug);
    const record = dataStore.getRecord(id);
    if (!test || !record || record.testSlug !== slug || !record.result) return handleNotFound(res);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderResultDetail(test, record));
    return;
  }

  handleNotFound(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
