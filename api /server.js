const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

/*
 * Health check
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        message: "API is running"
    });
});

/*
 * Test API endpoint
 */
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Docker API is running successfully"
    });
});

/*
 * Start server
 */
app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server running on port ${PORT}`);
});
