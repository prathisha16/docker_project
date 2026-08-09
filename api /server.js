const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 5000;

/*
 * Middleware
 */
app.use(cors());
app.use(express.json());


/*
 * Read Docker secret
 */
function readSecret(secretName) {
    try {
        return fs
            .readFileSync(`/run/secrets/${secretName}`, "utf8")
            .trim();
    } catch (error) {
        console.error(
            `Unable to read secret: ${secretName}`,
            error.message
        );
        throw error;
    }
}


/*
 * Database configuration
 */
const DB_HOST = process.env.DB_HOST || "mysql";
const DB_PORT = process.env.DB_PORT || 3306;

const DB_USER = readSecret("mysql_user");
const DB_PASSWORD = readSecret("mysql_password");
const DB_NAME = readSecret("mysql_database");


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

    connectionLimit: 10,

    queueLimit: 0
});


/*
 * Root endpoint
 */
app.get("/", (req, res) => {

    res.status(200).json({
        message: "Docker API is running successfully"
    });

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

        console.error(
            "Database health check failed:",
            error.message
        );

        res.status(500).json({
            status: "unhealthy",
            message: "Database connection failed"
        });

    }

});


/*
 * Get all Docker topics
 */
app.get("/topics", async (req, res) => {

    try {

        const [rows] = await pool.query(
            `
            SELECT
                id,
                docker,
                created_at
            FROM docker_data
            ORDER BY id DESC
            `
        );

        res.status(200).json(rows);

    } catch (error) {

        console.error(
            "Error fetching Docker topics:",
            error.message
        );

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


        /*
         * Validate input
         */
        if (
            typeof docker !== "string" ||
            docker.trim() === ""
        ) {

            return res.status(400).json({
                error: "Docker topic is required"
            });

        }


        const topic = docker.trim();


        /*
         * Insert topic into MySQL
         */
        const [result] = await pool.execute(
            "INSERT INTO docker_data (docker) VALUES (?)",
            [topic]
        );


        res.status(201).json({

            message: "Docker topic added successfully",

            id: result.insertId,

            docker: topic

        });

    } catch (error) {

        console.error(
            "Error adding Docker topic:",
            error.message
        );

        res.status(500).json({
            error: "Unable to add Docker topic"
        });

    }

});


/*
 * Start server
 */
app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `API server running on port ${PORT}`
    );

});
