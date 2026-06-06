require("dotenv").config();
const db = require("./src/config/db");

async function start() {
  // Initialize SQLite before accepting requests
  await db.init();

  const app = require("./src/app");
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 AI Future Passport server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
