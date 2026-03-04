# Magwegwe West SDA Membership System

Production-ready stack:
- React frontend (Vite)
- Laravel 12 API (`backend/`)
- MySQL (cPanel target)

## Local Development

### Frontend
```bash
npm install
npm run dev
```

### Backend (Laravel)
```bash
cd backend
php ../composer.phar install --no-dev --prefer-dist --ignore-platform-req=ext-gd --ignore-platform-req=ext-zip
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan legacy:import   # optional, if legacy_* tables exist
php artisan serve
```

API base (frontend):
- `VITE_API_BASE_URL=http://localhost:8000/api/v1`

## Deployment
See:
- `backend/DEPLOYMENT.md`
- `backend/CUTOVER.md`
