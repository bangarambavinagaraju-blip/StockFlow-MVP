// ==========================================
// STOCKFLOW MVP - BACKEND SERVER
// ==========================================

// IMPORT PACKAGES
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// IMPORT DATABASE
const pool = require("./config/db");

// IMPORT ROUTES
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

// INITIALIZE EXPRESS
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS CONFIGURATION
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// PARSE JSON REQUESTS
app.use(express.json());

// PARSE FORM DATA
app.use(express.urlencoded({ extended: true }));

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to StockFlow API",
        status: "Running successfully"
    });
});

// ==========================================
// DATABASE CONNECTION TEST
// ==========================================

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database,
                NOW() AS server_time
        `);

        res.status(200).json({
            success: true,
            message: "Database connected successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Database Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// SIGNUP:
// POST /api/auth/signup

// LOGIN:
// POST /api/auth/login

app.use("/api/auth", authRoutes);

// ==========================================
// PRODUCT ROUTES
// ==========================================

// GET    /api/products
// GET    /api/products/:id
// POST   /api/products
// PUT    /api/products/:id
// DELETE /api/products/:id

app.use("/api/products", productRoutes);

// ==========================================
// 404 ERROR HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("------------------------------------");
    console.log("          STOCKFLOW MVP API");
    console.log("------------------------------------");
    console.log(`Server running: http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log("Authentication routes: Enabled");
    console.log("Product routes: Enabled");
    console.log("------------------------------------");
});