const { Pool } = require("pg");
require("dotenv").config();

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
    : new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

pool.connect((err, client) => {
    if (err) {
        console.error("PostgreSQL connection failed:", err.message);
    } else {
        console.log("PostgreSQL connected successfully!");
        client.release();
    }
});

module.exports = pool;