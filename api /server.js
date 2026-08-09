const express = require("express");
const mysql = require("mysql2/promise");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

/*
 * Read Docker secrets
 */
function readSecret(name) {
    return fs.readFileSync(`/run/secrets/${name}`, "utf8").trim();
}

const DB_USER = readSecret("mysql_user");
const DB_PASSWORD = readSecret("mysql_password");
const DB_NAME = readSecret("mysql_database");

const DB_HOST = process.env.DB_HOST || "mysql";
const DB_PORT = process.env.DB_PORT || 3306;

/*
 * MySQL connection pool
 */
const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});


/*
 * Health check
 */
app.get("/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.status(200).json({
            status: "healthy",
            message: "API and database are running"
        });

    } catch (error) {

        console.error("Database health check failed:", error.message);

        res.status(500).json({
            status: "unhealthy",
            message: "Database connection failed"
        });
    }
});


/*
 * Test API
 */
app.get("/", (req, res) => {

    res.status(200).json({
        message: "Docker API is running successfully"
    });
});


/*
 * Get all Docker topics
 */
app.get("/topics", async (req, res) => {

    try {

        const [rows] = await pool.query(
            "SELECT id, docker, created_at FROM docker_data ORDER BY id DESC"
        );

        res.status(200).json(rows);

    } catch (error) {

        console.error("Error fetching topics:", error.message);

        res.status(500).json({
            error: "Unable to fetch Docker topics"
        });
    }
});


/*
 * Add Docker topic
 */
app.post("/topics", async (req, res) => {

    try {

        const { docker } = req.body;

        if (!docker || !docker.trim()) {

            return res.status(400).json({
                error: "Docker topic is required"
            });
        }

        const [result] = await pool.query(
            "INSERT INTO docker_data (docker) VALUES (?)",
            [docker.trim()]
        );

        res.status(201).json({
            message: "Docker topic added successfully",
            id: result.insertId,
            docker: docker.trim()
        });

    } catch (error) {

        console.error("Error adding Docker topic:", error.message);

        res.status(500).json({
            error: "Unable to add Docker topic"
        });
    }
});


/*
 * Start API server
 */
app.listen(PORT, "0.0.0.0", () => {

    console.log(`API server running on port ${PORT}`);

});
