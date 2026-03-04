const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const configs = [
    {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: process.env.DB_NAME
    },
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: process.env.DB_NAME
    },
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: process.env.DB_NAME
    }
];

async function createAdmin() {
    const adminEmail = 'admin@magwegwesda.org';
    const adminPassword = 'admin123';
    const adminName = 'System Administrator';

    let connection = null;
    let workingConfig = null;

    console.log(`Target Database: ${process.env.DB_NAME}`);

    for (const config of configs) {
        try {
            console.log(`Trying connection with user: ${config.user}, password: ${config.password ? '****' : '(empty)'}...`);
            connection = await mysql.createConnection(config);
            console.log('Connected successfully!');
            workingConfig = config;
            break;
        } catch (err) {
            console.log(`Failed: ${err.message}`);
        }
    }

    if (!connection) {
        console.error('Could not connect to database with any common credentials.');
        process.exit(1);
    }

    try {
        // Create Admin Logic
        console.log('Checking for existing admin user...');
        const [existingUsers] = await connection.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (existingUsers.length > 0) {
            console.log('Admin user already exists.');
            console.log('If you need to reset the password, you can update it manually in the database.');
        } else {
            console.log('Creating new admin user...');
            const hash = await bcrypt.hash(adminPassword, 10);
            const id = 'admin-' + Date.now();

            await connection.execute(`
                INSERT INTO users (id, name, email, password_hash, role, created_at)
                VALUES (?, ?, ?, ?, 'ADMIN', NOW())
            `, [id, adminName, adminEmail, hash]);

            console.log(`Admin user created successfully!`);
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        // Recommend updating .env if needed
        if (workingConfig.user !== process.env.DB_USER || workingConfig.password !== process.env.DB_PASSWORD) {
            console.log('\n--- IMPORTANT ---');
            console.log(`The credentials in .env seem incorrect. Use these instead:`);
            console.log(`DB_USER=${workingConfig.user}`);
            console.log(`DB_PASSWORD=${workingConfig.password}`);
            console.log('-----------------');
        }

    } catch (err) {
        console.error('Error executing query:', err);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

createAdmin();
