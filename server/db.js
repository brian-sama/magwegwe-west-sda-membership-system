const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false') 
    ? { rejectUnauthorized: false } 
    : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
