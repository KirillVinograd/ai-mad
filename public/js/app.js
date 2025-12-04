function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU');
}

function renderIntake(container, test, onSubmit) {
  const form = createElement(`<form class="form-grid">
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
      <label>Место учёбы / работы<input name="organization" placeholder="Компания, вуз, школа"/></label>
      <label>Должность / роль<input name="position" placeholder="Специалист, студент, руководитель"/></label>
      <label class="span-2">Комментарий<textarea name="notes" rows="3" placeholder="Дополнительная информация для специалиста"></textarea></label>
      <div class="form-actions span-2">
        <button class="button primary" type="submit">Начать тест</button>
      </div>
    </form>`);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const person = Object.fromEntries(formData.entries());
    const response = await fetch(`/api/tests/${test.slug}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Не удалось создать сессию');
      return;
    }
    onSubmit(data.session_id, person);
  });

  container.innerHTML = '';
  container.appendChild(createElement('<h3>Персональные данные</h3>'));
  container.appendChild(createElement('<p class="muted">Ответы сохраняются вместе с метаданными участника.</p>'));
  container.appendChild(form);
}

function groupQuestionsByPage(questions) {
  const pages = {};
  questions.forEach((q) => {
    if (!pages[q.page]) pages[q.page] = [];
    pages[q.page].push(q);
  });
  return Object.entries(pages)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([page, items]) => ({ page: Number(page), questions: items }));
}

function renderQuestion(question, answers) {
  if (question.type === 'boolean') {
    const current = answers[question.id];
    const yesChecked = current === 'yes' ? 'checked' : '';
    const noChecked = current === 'no' ? 'checked' : '';
    return createElement(`<div class="question">
        <div class="question-header">
          <span class="badge neutral">${question.text}</span>
        </div>
        <div class="options">
          <label class="option"><input type="radio" name="${question.id}" value="yes" ${yesChecked} required/>Да</label>
          <label class="option"><input type="radio" name="${question.id}" value="no" ${noChecked} required/>Нет</label>
        </div>
      </div>`);
  }

  const selected = Array.isArray(answers[question.id]) ? answers[question.id] : [];
  const checkbox = createElement(`<div class="question">
      <div class="question-header">
        <span class="badge neutral">Блок</span>
        <p>${question.text}</p>
        <p class="muted">Выберите до ${question.max_select || 3} вариантов</p>
      </div>
      <div class="options" data-question="${question.id}"></div>
    </div>`);
  const optionsWrap = checkbox.querySelector('.options');
  const options = question.options && question.options.length ? question.options : ['да', 'нет'];
  options.forEach((opt, index) => {
    const value = `${question.id}_${index}`;
    const checked = selected.includes(value) ? 'checked' : '';
    const node = createElement(
      `<label class="option"><input type="checkbox" name="${question.id}" value="${value}" ${checked}/> ${opt === 'choose' ? 'Выбрать' : opt}</label>`
    );
    optionsWrap.appendChild(node);
  });
  return checkbox;
}

function renderAssessment(root, test, sessionId, person) {
  const container = root.querySelector('.assessment');
  if (!container) return;
  const pages = groupQuestionsByPage(test.questions);
  let currentIndex = 0;
  const answers = {};
  const progress = createElement('<div class="progress"><div class="bar"></div><div class="caption"></div></div>');
  const questionArea = createElement('<div class="question-list"></div>');
  const controls = createElement(`<div class="form-actions">
      <button class="button ghost" type="button" id="prev">Назад</button>
      <button class="button primary" type="button" id="next">Далее</button>
    </div>`);

  const updateProgress = () => {
    const totalAnswered = Object.keys(answers).length;
    const totalQuestions = test.questions.length;
    const percent = Math.round((totalAnswered / totalQuestions) * 100);
    progress.querySelector('.bar').style.width = `${percent}%`;
    progress.querySelector('.caption').textContent = `${totalAnswered} / ${totalQuestions} (${percent}%)`;
  };

  const saveAnswersFromPage = () => {
    const inputs = questionArea.querySelectorAll('input');
    const checkboxState = {};
    inputs.forEach((input) => {
      if (input.type === 'radio') {
        if (input.checked) answers[input.name] = input.value;
      } else if (input.type === 'checkbox') {
        if (!checkboxState[input.name]) checkboxState[input.name] = new Set(answers[input.name] || []);
        const state = checkboxState[input.name];
        if (input.checked) state.add(input.value);
        else state.delete(input.value);
      }
    });
    Object.entries(checkboxState).forEach(([name, set]) => {
      if (set.size) answers[name] = Array.from(set);
      else delete answers[name];
    });
  };

  const renderPage = () => {
    questionArea.innerHTML = '';
    const page = pages[currentIndex];
    page.questions.forEach((q) => {
      questionArea.appendChild(renderQuestion(q, answers));
    });
    updateProgress();
    controls.querySelector('#prev').disabled = currentIndex === 0;
    controls.querySelector('#next').textContent = currentIndex === pages.length - 1 ? 'Завершить' : 'Далее';
  };

  controls.querySelector('#prev').addEventListener('click', () => {
    saveAnswersFromPage();
    if (currentIndex > 0) currentIndex -= 1;
    renderPage();
  });

  controls.querySelector('#next').addEventListener('click', async () => {
    saveAnswersFromPage();
    const requiredQuestions = pages[currentIndex].questions.filter((q) => q.type === 'boolean');
    const missing = requiredQuestions.find((q) => !answers[q.id]);
    if (missing) {
      alert('Ответьте на все обязательные вопросы на странице');
      return;
    }
    if (currentIndex < pages.length - 1) {
      currentIndex += 1;
      renderPage();
      return;
    }

    const payload = { answers };
    const response = await fetch(`/api/tests/${test.slug}/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Не удалось сохранить ответы');
      return;
    }
    if (test.id === 'mlo_am') {
      window.location.href = `/tests/${test.slug}/complete?id=${sessionId}`;
      return;
    }
    renderResults(root, test, person, data);
  });

  container.innerHTML = '';
  container.appendChild(createElement(`<div class="person-card"><div><div class="badge">${person.fullName || 'Участник'}</div><p class="muted">${person.email || '—'} · ${person.phone || '—'}</p></div><div class="muted">Сессия: ${sessionId}</div></div>`));
  container.appendChild(progress);
  container.appendChild(questionArea);
  container.appendChild(controls);
  renderPage();
}

function renderResults(container, test, person, result) {
  const scales = result.scales || [];
  const bars = scales
    .filter((s) => !s.scale_id.startsWith('risk_'))
    .map(
      (s) => `<div class="scale-row">
        <div class="scale-title">${s.name}</div>
        <div class="scale-bar"><span style="width:${s.normalized}%"></span></div>
        <div class="scale-meta">${s.level || '—'} · ${s.normalized}%</div>
      </div>`
    )
    .join('');
  const risks = scales
    .filter((s) => s.scale_id.startsWith('risk_'))
    .map((s) => `<li>${s.name}: ${s.level || '—'}</li>`)
    .join('');
  const block = createElement(`<div class="results-block">
      <div class="person-card">
        <div>
          <div class="badge">${person.fullName || 'Участник'}</div>
          <p class="muted">${person.email || '—'} · ${person.phone || '—'}</p>
        </div>
        <div class="muted">Длительность: ${result.duration_sec ? result.duration_sec + ' сек' : '—'}</div>
      </div>
      <h3>Итоговые шкалы</h3>
      <div class="scales">${bars}</div>
      ${risks ? `<div class="risk-block"><h4>Риски</h4><ul>${risks}</ul></div>` : ''}
      <div class="summary">${result.summary_text || ''}</div>
    </div>`);

  const assessment = container.querySelector('.assessment');
  assessment?.classList.add('hidden');
  const resultsWrap = container.querySelector('.results');
  if (resultsWrap) {
    resultsWrap.innerHTML = '';
    resultsWrap.classList.remove('hidden');
    resultsWrap.appendChild(block);
  }
}

function buildStenBar(value, label, compact = false) {
  const total = 10;
  const segments = Array.from({ length: total }, (_, i) => {
    const index = i + 1;
    const state = index <= value ? (index <= 3 ? 'low' : index <= 7 ? 'mid' : 'high') : 'off';
    return `<div class="sten-segment ${state}"></div>`;
  }).join('');
  return `<div class="sten-bar ${compact ? 'compact' : ''}">
      <div class="sten-bar__segments">${segments}</div>
      <div class="sten-bar__label">${label || ''}</div>
    </div>`;
}

function buildRangeBar(value) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  const zone = clamped < 50 ? 'low' : clamped <= 70 ? 'mid' : 'high';
  return `<div class="range-bar ${zone}"><div class="range-bar__fill" style="width:${clamped}%"></div></div>`;
}

function renderMloComplete(root, record) {
  const result = record.result;
  if (!result) {
    root.innerHTML = '<div class="alert">Результаты не найдены.</div>';
    return;
  }

  const person = record.person || {};
  const scales = result.scales || [];
  const derived = result.derived || {};
  const normTables = result.norm_tables || {};

  const findScale = (id) => scales.find((s) => s.scale_id === id);
  const stenScalesOrder = ['D', 'A', 'B', 'C', 'I', 'G', 'H', 'L', 'F', 'K', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B0'];
  const formatNormalized = (scale) => {
    if (!scale || scale.normalized === undefined || scale.normalized === null) return '—';
    if (scale.normalized_kind === 't_score') return `T=${scale.normalized}`;
    return `${scale.normalized} стен`;
  };

  const scaleRows = stenScalesOrder
    .map((id) => findScale(id))
    .filter(Boolean)
    .map(
      (scale) => `<tr>
          <td class="code">${scale.scale_id}</td>
          <td>${scale.name}</td>
          <td>${scale.raw_score}</td>
          <td>${scale.formula || '—'}</td>
          <td>${scale.k_correction_added || 0}</td>
          <td>${scale.final_score}</td>
          <td>${scale.max_score || '—'}</td>
          <td>${formatNormalized(scale)}</td>
        </tr>`
    )
    .join('');

  const stenColumns = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const stenTableRows = ['A', 'B', 'C', 'D', 'G', 'H', 'I']
    .map((id) => {
      const table = normTables[id] || [];
      const cells = stenColumns
        .map((sten) => {
          const entry = table.find((row) => row.sten === sten);
          if (!entry) return '<td>—</td>';
          return `<td>${entry.min === entry.max ? entry.min : `${entry.min}–${entry.max}`}</td>`;
        })
        .join('');
      const actual = findScale(id)?.normalized || '—';
      return `<tr><td class="code">${id}</td>${cells}<td class="fact">${actual}</td></tr>`;
    })
    .join('');

  const lapScale = findScale('D');
  const blockLap = lapScale
    ? `<div class="card shadow">
        <div class="card-header compact"><h3>Личностный адаптивный потенциал</h3></div>
        ${buildStenBar(lapScale.normalized, `[ ${lapScale.level || '—'} : ${derived?.LAP?.group || 'группа'} ]`)}
        <div class="lap-meta muted">Возрастные нормы: ${derived?.LAP?.age_band || '—'}</div>
        <div class="mini-bars">
          ${buildStenBar(findScale('A')?.normalized, `A · ${findScale('A')?.level || '—'}`, true)}
          ${buildStenBar(findScale('B')?.normalized, `B · ${findScale('B')?.level || '—'}`, true)}
          ${buildStenBar(findScale('C')?.normalized, `C · ${findScale('C')?.level || '—'}`, true)}
        </div>
        <div class="legend">ниже среднего ⇒ средний ⇒ выше среднего</div>
      </div>`
    : '';

  const mmpiRows = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B0']
    .map((id, idx) => {
      const scale = findScale(id);
      if (!scale) return '';
      return `<div class="mmpi-row">
          <div class="mmpi-title">Шкала ${idx === 9 ? '0' : idx + 1}: ${scale.name.replace(/^Шкала \d+:\s*/i, '')}</div>
          <div class="mmpi-bar">${buildRangeBar(scale.normalized || 0)}</div>
          <div class="mmpi-score">${scale.normalized || '—'}</div>
        </div>`;
    })
    .join('');

  const maladScale = findScale('I');
  const blockMal = maladScale
    ? `<div class="card shadow">
        <div class="card-header compact"><h3>Дезадаптационные нарушения</h3></div>
        ${buildStenBar(maladaptationVal(maladScale), `[ ${maladScale.level || '—'} ]`)}
        <div class="mini-bars">
          ${buildStenBar(findScale('G')?.normalized, `G · ${findScale('G')?.level || '—'}`, true)}
          ${buildStenBar(findScale('H')?.normalized, `H · ${findScale('H')?.level || '—'}`, true)}
        </div>
        <div class="legend">значительная выраженность ⇒ допустимая норма ⇒ отсутствие признаков</div>
      </div>`
    : '';

  function maladaptationVal(scale) {
    return scale?.normalized || 0;
  }

  const infoBlock = `<div class="person-card">
      <div>
        <div class="badge">${person.fullName || 'Участник'}</div>
        <p class="muted">Возраст: ${person.age || '—'} · Пол: ${person.gender || '—'}</p>
        <p class="muted">${person.email || '—'} · ${person.phone || '—'}</p>
      </div>
      <div class="muted">Старт: ${formatDate(record.startedAt)} · Завершено: ${formatDate(record.finishedAt)}</div>
    </div>`;

  root.innerHTML = `<div class="result-meta">${infoBlock}
      <p class="summary-text">${result.summary_text || ''}</p>
    </div>
    <div class="table-wrapper">
      <table class="mlo-scale-table">
        <thead>
          <tr><th>Код</th><th>Шкала</th><th>Сырой балл</th><th>Формула</th><th>Корр.</th><th>Балл</th><th>max</th><th>Стен/ТБалл</th></tr>
        </thead>
        <tbody>${scaleRows}</tbody>
      </table>
    </div>
    <div class="table-wrapper compact">
      <table class="sten-table">
        <thead><tr><th>Шкала</th>${stenColumns.map((c) => `<th>${c}</th>`).join('')}<th>Факт</th></tr></thead>
        <tbody>${stenTableRows}</tbody>
      </table>
    </div>
    <div class="card-grid">
      ${blockLap}
      <div class="card shadow">
        <div class="card-header compact"><h3>Шкалы MMPI</h3></div>
        <div class="mmpi-block">${mmpiRows}</div>
        <div class="legend">низкие ⇒ средние ⇒ высокие значения</div>
      </div>
      ${blockMal}
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach((link) => {
    if (link.textContent.trim() === 'Написать команде') {
      link.remove();
    }
  });
});

async function bootstrapTest(root) {
  const slug = root.dataset.testSlug;
  const intake = root.querySelector('.intake');
  const assessment = root.querySelector('.assessment');
  const response = await fetch(`/api/tests/${slug}`);
  const test = await response.json();
  if (!response.ok) {
    root.innerHTML = '<div class="alert">Методика не найдена</div>';
    return;
  }

  renderIntake(intake, test, (sessionId, person) => {
    intake.classList.add('hidden');
    assessment.classList.remove('hidden');
    renderAssessment(root, test, sessionId, person);
  });
}

async function bootstrapComplete(root) {
  const slug = root.dataset.testSlug;
  const sessionId = root.dataset.sessionId;
  if (!slug || !sessionId) {
    root.innerHTML = '<div class="alert">Не передан идентификатор протокола.</div>';
    return;
  }
  const response = await fetch(`/api/tests/${slug}/sessions/${sessionId}`);
  const record = await response.json();
  if (!response.ok || !record.result) {
    root.innerHTML = '<div class="alert">Не удалось загрузить результаты.</div>';
    return;
  }
  if (record.result.test_id === 'mlo_am') {
    renderMloComplete(root, record);
    return;
  }
  root.innerHTML = '<div class="alert">Специализированный вывод не настроен для этой методики.</div>';
}

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('test-root');
  if (root) {
    bootstrapTest(root).catch((err) => {
      console.error(err);
      root.innerHTML = '<div class="alert">Не удалось загрузить методику.</div>';
    });
  }
  const completeRoot = document.getElementById('complete-root');
  if (completeRoot) {
    bootstrapComplete(completeRoot).catch((err) => {
      console.error(err);
      completeRoot.innerHTML = '<div class="alert">Не удалось загрузить результаты.</div>';
    });
  }
});
