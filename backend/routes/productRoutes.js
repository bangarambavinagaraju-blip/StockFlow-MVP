// ==========================================
// STOCKFLOW - PRODUCT MANAGEMENT ROUTES
// Organization-based data isolation
// ==========================================

const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protect ALL product routes
router.use(authMiddleware);


// ==========================================
// HELPER: VALIDATE PRICE
// ==========================================

const isValidPrice = value => {
    return (
        value === null ||
        value === undefined ||
        (
            value !== "" &&
            Number.isFinite(Number(value)) &&
            Number(value) >= 0
        )
    );
};


// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// ==========================================

router.get("/", async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const result = await pool.query(
            `SELECT *
             FROM products
             WHERE organization_id = $1
             ORDER BY id DESC`,
            [organizationId]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get products error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve products."
        });
    }
});


// ==========================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ==========================================

router.get("/:id", async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM products
             WHERE id = $1
             AND organization_id = $2`,
            [productId, organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve product."
        });
    }
});


// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================

router.post("/", async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const {
            name,
            sku,
            description,
            quantity,
            cost_price,
            selling_price,
            low_stock_threshold
        } = req.body;

        // Required field validation
        if (!name?.trim() || !sku?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name and SKU are required."
            });
        }

        const stockQuantity = Number(quantity);

        if (
            quantity === undefined ||
            quantity === null ||
            quantity === "" ||
            !Number.isInteger(stockQuantity) ||
            stockQuantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a non-negative integer."
            });
        }

        // Price validation
        if (
            !isValidPrice(cost_price) ||
            !isValidPrice(selling_price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Prices must be non-negative numbers."
            });
        }

        // Threshold validation
        const threshold =
            low_stock_threshold === undefined ||
            low_stock_threshold === null ||
            low_stock_threshold === ""
                ? 5
                : Number(low_stock_threshold);

        if (
            !Number.isInteger(threshold) ||
            threshold < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Low-stock threshold must be a non-negative integer."
            });
        }

        // Insert product into authenticated organization
        const result = await pool.query(
            `INSERT INTO products (
                organization_id,
                name,
                sku,
                description,
                quantity,
                cost_price,
                selling_price,
                low_stock_threshold
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                organizationId,
                name.trim(),
                sku.trim(),
                description?.trim() || null,
                stockQuantity,
                cost_price === "" || cost_price === undefined
                    ? null
                    : cost_price,
                selling_price === "" || selling_price === undefined
                    ? null
                    : selling_price,
                threshold
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: result.rows[0]
        });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This SKU already exists in your organization."
            });
        }

        console.error("Create product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to create product."
        });
    }
});


// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================

router.put("/:id", async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const allowedFields = {
            name: "name",
            sku: "sku",
            description: "description",
            quantity: "quantity",
            cost_price: "cost_price",
            selling_price: "selling_price",
            low_stock_threshold: "low_stock_threshold"
        };

        const updates = [];
        const values = [];

        for (const field of Object.keys(allowedFields)) {

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {

                const value = req.body[field];

                if (field === "name" || field === "sku") {
                    if (typeof value !== "string" || !value.trim()) {
                        return res.status(400).json({
                            success: false,
                            message: `${field} cannot be empty.`
                        });
                    }

                    values.push(value.trim());

                } else if (field === "quantity" ||
                           field === "low_stock_threshold") {

                    const number = Number(value);

                    if (
                        value === "" ||
                        !Number.isInteger(number) ||
                        number < 0
                    ) {
                        return res.status(400).json({
                            success: false,
                            message: `${field} must be a non-negative integer.`
                        });
                    }

                    values.push(number);

                } else if (
                    field === "cost_price" ||
                    field === "selling_price"
                ) {

                    if (!isValidPrice(value)) {
                        return res.status(400).json({
                            success: false,
                            message: `${field} must be a non-negative number.`
                        });
                    }

                    values.push(
                        value === "" || value === null
                            ? null
                            : Number(value)
                    );

                } else if (field === "description") {

                    if (value !== null && typeof value !== "string") {
                        return res.status(400).json({
                            success: false,
                            message: "Description must be text."
                        });
                    }

                    values.push(value?.trim() || null);
                }

                updates.push(
                    `${allowedFields[field]} = $${values.length}`
                );
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update."
            });
        }

        // Add updated timestamp
        updates.push("updated_at = CURRENT_TIMESTAMP");

        // Add product ID and organization ID
        values.push(productId);
        const productIdPosition = values.length;

        values.push(organizationId);
        const organizationIdPosition = values.length;

        const query = `
            UPDATE products
            SET ${updates.join(", ")}
            WHERE id = $${productIdPosition}
            AND organization_id = $${organizationIdPosition}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: result.rows[0]
        });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This SKU already exists in your organization."
            });
        }

        console.error("Update product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update product."
        });
    }
});


// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================

router.delete("/:id", async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const result = await pool.query(
            `DELETE FROM products
             WHERE id = $1
             AND organization_id = $2
             RETURNING id`,
            [productId, organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {
        console.error("Delete product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete product."
        });
    }
});

module.exports = router;