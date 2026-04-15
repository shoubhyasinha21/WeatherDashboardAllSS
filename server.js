require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 2109;

// ===============================
// 🌐 SERVE FRONTEND
// ===============================
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// 🌤️ WEATHER ROUTE
// ===============================
app.get("/weather", async (req, res) => {
    try {
        const { city, lat, lon } = req.query;

        let url;

        // 🌍 Location-based weather
        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=metric`;
        }
        // 🏙️ City-based weather
        else if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}&units=metric`;
        }
        // ❌ No input
        else {
            return res.status(400).json({ error: "No location provided" });
        }

        const response = await fetch(url);
        const data = await response.json();

        // 🔴 Handle API errors safely
        if (!response.ok) {
            console.error("Weather API Error:", data);
            return res.status(response.status).json(data);
        }

        res.json(data);

    } catch (err) {
        console.error("Weather Server Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ===============================
// ⏱️ FORECAST ROUTE
// ===============================
app.get("/forecast", async (req, res) => {
    try {
        const { lat, lon } = req.query;

        // 🔴 validation
        if (!lat || !lon) {
            return res.status(400).json({ error: "Missing coordinates" });
        }

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=metric`;

        const response = await fetch(url);
        const data = await response.json();

        // 🔴 Handle API errors safely
        if (!response.ok) {
            console.error("Forecast API Error:", data);
            return res.status(response.status).json(data);
        }

        res.json(data);

    } catch (err) {
        console.error("Forecast Server Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});