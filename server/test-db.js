const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    const configs = [
        {
            name: "From .env",
            config: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            }
        },
        {
            name: "Localhost root (no password)",
            config: {
                host: 'localhost',
                user: 'root',
                password: '',
                database: process.env.DB_NAME || 'magweusf_magwegwe_sda_db'
            }
        },
        {
            name: "cPanel user",
            config: {
                host: 'localhost',
                user: 'magweusf_magwegwe_sda_db',
                password: 'bb5zeB97bdG8MQctYBzn',
                database: 'magweusf_magwegwe_sda_db'
            }
        }
    ];

    console.log('🔍 Testing Database Connections...\n');

    for (const { name, config } of configs) {
        try {
            console.log(`Testing: ${name}`);
            console.log(`  Host: ${config.host}`);
            console.log(`  User: ${config.user}`);
            console.log(`  Database: ${config.database}`);
            
            const connection = await mysql.createConnection(config);
            
            // Test if users table exists
            const [tables] = await connection.execute(
                "SHOW TABLES LIKE 'users'"
            );
            
            if (tables.length > 0) {
                // Check if admin user exists
                const [users] = await connection.execute(
                    "SELECT id, name, email, role FROM users WHERE role = 'ADMIN'"
                );
                console.log(`  ✅ SUCCESS!`);
                console.log(`  📊 Found ${users.length} admin user(s)`);
                if (users.length > 0) {
                    console.log(`     Admin: ${users[0].email}`);
                }
            } else {
                console.log(`  ⚠️  Connected but 'users' table doesn't exist`);
                console.log(`     Run database_schema.sql to create tables`);
            }
            
            await connection.end();
            console.log('');
            break; // Stop on first success
            
        } catch (err) {
            console.log(`  ❌ FAILED: ${err.message}\n`);
        }
    }
}

testConnection().then(() => {
    console.log('✅ Test complete');
    process.exit(0);
}).catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
