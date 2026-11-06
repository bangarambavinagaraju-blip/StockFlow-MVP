const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// =====================================
// USER SIGNUP
// POST /api/auth/signup
// =====================================

router.post("/signup", async (req, res) => {
    const { email, password, organization_name } = req.body;

if (
    !email?.trim() ||
    !password ||
    !organization_name?.trim()
) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters."
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existingUser = await client.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const organizationResult = await client.query(
            `INSERT INTO organizations (name)
             VALUES ($1)
             RETURNING id, name`,
            [organization_name.trim()]
        );

        const organization = organizationResult.rows[0];

        const userResult = await client.query(
            `INSERT INTO users
             (organization_id, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, organization_id, email`,
            [
                organization.id,
                normalizedEmail,
                passwordHash
            ]
        );

        const user = userResult.rows[0];

        await client.query(
            `INSERT INTO settings
             (organization_id, default_low_stock_threshold)
             VALUES ($1, $2)
             ON CONFLICT (organization_id) DO NOTHING`,
            [organization.id, 5]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: {
                user,
                organization
            }
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Signup error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create account."
        });

    } finally {
        client.release();
    }
});


// =====================================
// USER LOGIN
// POST /api/auth/login
// =====================================

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    try {

        const result = await pool.query(
            `SELECT
                u.id,
                u.email,
                u.password_hash,
                u.organization_id,
                o.name AS organization_name
             FROM users u
             JOIN organizations o
             ON u.organization_id = o.id
             WHERE u.email = $1`,
            [email.trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                organizationId: user.organization_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                email: user.email,
                organization_id: user.organization_id,
                organization_name: user.organization_name
            }
        });

    } catch (error) {

        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to login."
        });

    }
});

module.exports = router;