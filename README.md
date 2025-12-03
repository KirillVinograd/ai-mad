# ai-mad

Одностраничное приложение на Node.js для проведения базовых версий тестов СМИЛ/MMPI, опросника Шмишека, EPI и ПДО. Встроены отдельные ссылки для ввода персональных данных, прохождения теста и просмотра результатов (закрытая ссылка `/tests/:slug/results`).

## Запуск

Без внешних зависимостей — используется только стандартная библиотека Node.js.

```bash
node app.js
```

Сервер будет доступен на http://localhost:3000.

### Запуск через Docker

Обязательно указывайте контекст сборки (`.`) в конце команды. Для сохранения результатов поверх перезапусков примонтируйте локальную папку к `/usr/src/app/data`.

```bash
docker build -t ai-mad .
docker run -d -p 3000:3000 -v $(pwd)/data:/usr/src/app/data --name ai-mad ai-mad
```

### Запуск через Docker Compose

В репозитории добавлен `docker-compose.yml` с теми же настройками. Можно поднять контейнер одной командой:

```bash
docker compose up --build -d
```

Папка `./data` автоматически монтируется в контейнер и сохраняет `data/responses.json` между перезапусками.

### Привязка домена, если на сервере несколько сайтов

1. Запустите этот сервис на внутреннем порту (по умолчанию 3000 через `docker compose up -d`).
2. Добавьте отдельный серверный блок в Nginx, чтобы домен `ai-mad.ru` вёл именно сюда, а другой сайт остался на своём домене. Пример конфигурации (см. файл `nginx-ai-mad.conf`):

   ```nginx
   server {
       listen 80;
       server_name ai-mad.ru www.ai-mad.ru;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Сохраните файл, например, в `/etc/nginx/sites-available/ai-mad.conf`, создайте симлинк в `sites-enabled` и выполните `nginx -t && systemctl reload nginx`.
4. Для второго сайта используйте отдельный серверный блок с его доменом — так оба проекта будут работать на одном сервере без конфликтов портов.

## Структура

- `/` — выбор методики и быстрые ссылки.
- `/tests/:slug/intake` — форма ввода персональных данных.
- `/tests/:slug/assessment` — прохождение теста по ссылке с `id` сохраненной анкеты.
- `/tests/:slug/complete?id=...` — персональные результаты.
- `/tests/:slug/results` — сводная таблица (не размещайте публично).

Данные сохраняются в `data/responses.json`.
