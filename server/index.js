require("dotenv").config();
const { initDb } = require("./src/config/db");

async function start() {
  await initDb();

  const app = require("./src/app");
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    const base = process.env.NODE_ENV === "production"
      ? `https://ai-passport.onrender.com`
      : `http://localhost:${PORT}`;
    console.log(`🚀 AI Future Passport server running on ${base}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err.message);
  process.exit(1);
});
