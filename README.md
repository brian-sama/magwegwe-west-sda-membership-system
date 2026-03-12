# Magwegwe West SDA Membership System

Production stack:
- React frontend (Vite)
- Plain PHP + PDO API (`api/`) for cPanel shared hosting
- MySQL

## Local Development

### Frontend
```bash
npm install
npm run dev
```

### Backend (Plain PHP)
```bash
cd api
cp .env.example .env
# Update DB credentials in .env
php -S localhost:8000
```

API base (frontend):
- `VITE_API_BASE_URL=http://localhost:8000/api/v1`

## Deployment
- cPanel API/backend docs: `api/README.md`
- root deployment flow: `DEPLOYMENT_INSTRUCTIONS.txt`
