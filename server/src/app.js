const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const passportRoutes = require("./routes/passport.routes");
const timemachineRoutes = require("./routes/timemachine.routes");
const radarRoutes = require("./routes/radar.routes");
const portfolioRoutes = require("./routes/portfolio.routes");
const scoreRoutes = require("./routes/score.routes");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/passport", passportRoutes);
app.use("/api/timemachine", timemachineRoutes);
app.use("/api/radar", radarRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/score", scoreRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
