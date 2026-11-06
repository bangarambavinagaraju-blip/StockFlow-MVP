const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction
            ? { rejectUnauthorized: false }
            : false
    })
    : new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

// Monitor database connection errors
pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error.message);
});

// Verify database connectivity
pool.query("SELECT NOW()")
    .then(() => {
        console.log("PostgreSQL connected successfully!");
    })
    .catch((error) => {
        console.error("PostgreSQL connection failed:", error.message);
    });

module.exports = pool;