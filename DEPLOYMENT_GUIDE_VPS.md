# Complete VPS Deployment Guide (Contabo)
## For: members.magwegwewestsda.co.zw

This guide provides step-by-step instructions to deploy the Magwegwe West SDA Membership System to your Contabo VPS.

### 1. Server Prerequisites
Run these commands on your VPS to ensure all necessary tools are installed:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Database Setup on VPS
Login to PostgreSQL and create the database and user:

```bash
sudo -u postgres psql
```

Inside the `psql` shell:
```sql
CREATE DATABASE magwegwe_membership;
CREATE USER magwegwe_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE magwegwe_membership TO magwegwe_admin;
\c magwegwe_membership
GRANT ALL ON SCHEMA public TO magwegwe_admin;
\q
```

Now, upload `database_schema_postgres.sql` to your VPS and import it:
```bash
psql -U magwegwe_admin -d magwegwe_membership -f database_schema_postgres.sql
```

### 3. Application Deployment

#### A. Build Frontend Locally
On your local machine, run:
```bash
npm run build
```
This will create a `dist/` folder.

#### B. Upload Files to VPS
Create a directory for the project:
```bash
sudo mkdir -p /var/www/magwegwe-system
sudo chown -R $USER:$USER /var/www/magwegwe-system
```

Upload the following to `/var/www/magwegwe-system/`:
- `dist/` (The entire folder)
- `server/` (The entire folder)
- `ecosystem.config.js`
- `package.json`

#### C. Configure Backend on VPS
Navigate to the project folder on your VPS:
```bash
cd /var/www/magwegwe-system/server
npm install --production

# Create .env file
nano .env
```
Paste the following and update with your VPS database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=magwegwe_admin
DB_PASSWORD=your_secure_password
DB_NAME=magwegwe_membership
JWT_SECRET=your_random_secret_string
NODE_ENV=production
```

### 4. Start the Server with PM2
```bash
cd /var/www/magwegwe-system
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 5. Nginx Configuration for Subdomain
Copy the provided `nginx_vps.conf` to Nginx sites-available:

```bash
sudo cp /var/www/magwegwe-system/nginx_vps.conf /etc/nginx/sites-available/magwegwe_membership
sudo ln -s /etc/nginx/sites-available/magwegwe_membership /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Optional: remove default if not needed

# Test and Restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL with Certbot (DNS must point to VPS IP)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d members.magwegwewestsda.co.zw
```

---
**Note:** Ensure your domain's DNS `A` record for `members` is pointing to your Contabo VPS IP address before running the Certbot command.
