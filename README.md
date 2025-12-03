# ai-mad

Одностраничное приложение на Node.js для проведения конфигурационно описанных версий МЛО-АМ («Многоуровневый личностный опросник Адаптивность»), опросника Шмишека, EPI и ПДО. Участник вводит персональные данные, после чего клиент загружает конфигурацию методики из JSON, строит адаптивную форму и отправляет результаты в API. Итоги доступны только по закрытой ссылке `/tests/:slug/results` и экспортируются в единый JSON-формат.

## Запуск

Без внешних зависимостей — используется только стандартная библиотека Node.js. Вся логика тестирования, расчёта баллов и нормирования вынесена в конфигурации и универсальный движок `lib/testEngine.js`.

```bash
node app.js
```

Сервер будет доступен на http://localhost:3000.

### Запуск через Docker Compose

Файл `docker-compose.yml` оформлен в стиле многосервисных стеков: Node.js-приложение и фронтовой Nginx. Запуск по аналогии с примером из вопроса:

```bash
docker compose up --build -d
```

Что внутри:

- `app` — билд из `Dockerfile`, переменные `NODE_ENV` и `PORT`, healthcheck, том `data` → `/usr/src/app/data` для сохранения `data/responses.json` между перезапусками (при желании можно заменить на bind mount `./data:/usr/src/app/data`).
- `nginx` — образ `nginx:alpine`, публикует порт 80:80 и использует конфигурацию из `nginx-ai-mad.conf` для проксирования на сервис `app`.

Контейнеры перезапускаются с политикой `unless-stopped`. Проброса порта 3000 наружу не требуется — наружу отдаёт только Nginx.

### Привязка домена, если на сервере несколько сайтов

1. Поднимите контейнеры (`docker compose up -d`). Внутри сети compose приложение слушает `app:3000`.
2. Конфиг `nginx-ai-mad.conf` в комплекте сразу проксирует `ai-mad.ru` на сервис `app`:

   ```nginx
   server {
       listen 80;
       server_name ai-mad.ru www.ai-mad.ru;

       location / {
           proxy_pass http://app:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Если хотите использовать внешний Nginx на хосте, сохраните конфиг в `/etc/nginx/sites-available/ai-mad.conf`, создайте симлинк в `sites-enabled` и выполните `nginx -t && systemctl reload nginx`. Прокси-адрес в таком случае оставьте `http://127.0.0.1:3000;`.
4. Для второго сайта используйте отдельный серверный блок с его доменом — так оба проекта будут работать на одном сервере без конфликтов портов.

## Структура

- `/` — выбор методики и кнопка «Пройти тест».
- `/tests/:slug/assessment` — страница ввода персональных данных и последующего прохождения теста.
- `/tests/:slug/complete?id=...` — персональные результаты.
- `/tests/:slug/results` — сводная таблица (не размещайте публично).

Данные сохраняются в `data/responses.json`.

## API и формат данных

- `GET /api/tests` — список методик (метаданные).
- `GET /api/tests/:slug` — полная конфигурация методики (вопросы, шкалы, нормы).
- `POST /api/tests/:slug/sessions` — создание сессии (тело: `{ person: { ... } }`), логирует старт.
- `POST /api/tests/:slug/sessions/:id/answers` — приём ответов и расчёт результатов; возвращает JSON формата:
  ```json
  {
    "test_id": "mlo_am",
    "session_id": "...",
    "started_at": "...",
    "finished_at": "...",
    "duration_sec": 123,
    "answers": [ { "question_id": "q1", "value": "yes" } ],
    "scales": [
      { "scale_id": "NPU", "name": "Нервно-психическая устойчивость", "raw_score": 4, "normalized": 62, "level": "средний", "interpretation": "..." }
    ],
    "derived": {},
    "validity": { "is_valid": true, "reason": null, "lie_scale_raw": 1, "lie_scale_level": "низкий" },
    "summary_text": "Краткое резюме..."
  }
  ```

Конфигурации тестов находятся в `configs/tests/*.json` и могут заменяться без изменения кода.
