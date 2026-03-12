# Plain PHP API (`/api/v1`) for cPanel Shared Hosting

This API replaces the Laravel runtime with a lightweight PHP + PDO backend that works reliably on cPanel shared hosting.

## What This Backend Provides

- Route base: `/api/v1`
- JWT auth (`Bearer` token)
- Role enforcement (`Admin`, `Pastor`, `Clerk`, `Viewer`)
- Write audit middleware
- Endpoints compatible with the current frontend contract:
  - `auth`, `members`, `youth`, `societies`, `users`, `audit-logs`, `attendance`
  - `reports/*` (`pdf`, `xlsx`)
  - `search/global`, `notifications/sms`, `analytics/insights`

## Configuration

1. Copy `.env.example` to `.env`
2. Set DB and service credentials
3. Generate a strong `JWT_SECRET`

If your host blocks `.env`, copy `config.local.php.example` to `config.local.php` and set values there.

## cPanel Deployment (Same Domain `/api/v1`)

1. Upload this `api/` folder under `public_html/api`.
2. Ensure `api/.htaccess` is present.
3. In your frontend `.htaccess`, keep API requests out of SPA rewrites:

```apache
RewriteCond %{REQUEST_URI} !^/api/
```

4. Deploy frontend build to `public_html` as usual.

## One-Command Cutover

From cPanel Terminal (in project root):

```bash
php api/scripts/cutover.php
```

This script performs:
- Source schema autodetect (`laravel` first, fallback `legacy`)
- Snapshot (if source and target are same DB)
- Backup of current target tables
- Fresh schema apply (`api/database/schema.sql`)
- Data import (password hashes preserved)
- Integrity checks (counts + orphan checks)

## Integrity Check Only

```bash
php api/scripts/check_integrity.php
```

## Contract Smoke Test

```bash
php api/scripts/contract_smoke.php https://yourdomain.com admin@example.com yourPassword
```

## Rollback

Cutover creates timestamped table backups:
- `backup_users_<timestamp>`, `backup_members_<timestamp>`, etc.

Rollback flow:
1. Put app in maintenance mode (or pause writes).
2. Restore tables from backup copies.
3. Re-test `/api/v1/auth/login` and `/api/v1/members`.

## Notes

- Existing Laravel tokens are not migrated; users must log in again after cutover.
- `reports?format=xlsx` requires PHP `ext-zip` (`ZipArchive`). If unavailable, API returns a clear error.
- `notifications/sms` and `analytics/insights` use real providers when credentials are configured; otherwise they return explicit fallback messages/errors.