module.exports = {
    apps: [
        {
            name: 'magwegwe-backend',
            script: 'server/index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
                DB_HOST: 'localhost',
                DB_USER: 'magweusf_magwegwe_members',
                DB_PASSWORD: 'your_production_password',
                DB_NAME: 'magweusf_magwegwe_members',
                JWT_SECRET: 'your_production_jwt_secret'
            }
        }
    ]
};
