# Laravel API Deployment (cPanel)

## 1. Subdomain
- Create `api.your-domain.com` in cPanel.
- Set document root to `backend/public`.

## 2. Upload & Install
- Upload backend code.
- SSH into cPanel account and run:

```bash
cd ~/path/to/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 3. Queue + Scheduler
- Add cPanel cron for scheduler:

```bash
* * * * * /usr/local/bin/php /home/USER/path/to/backend/artisan schedule:run >> /dev/null 2>&1
```

- Run queue worker (Supervisor or cPanel background job):

```bash
php artisan queue:work --tries=3
```

## 4. Frontend Deploy
- Build frontend:

```bash
npm run build
```

- Upload `dist/` contents to `public_html`.
- Set `VITE_API_BASE_URL=https://api.your-domain.com/api/v1` before build.

## 5. Security Checklist
- Rotate all leaked historical secrets before go-live.
- Set production DB credentials only in `.env`.
- Configure `CORS_ALLOWED_ORIGINS` to only trusted frontend domains.
- Ensure HTTPS is enabled for frontend + API.
