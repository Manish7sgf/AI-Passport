const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  // PostgreSQL unique violation
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      error: "A record with this value already exists",
      code: "DUPLICATE_ENTRY"
    });
  }

  // PostgreSQL connection error
  if (err.code === "ECONNREFUSED" || err.code === "57P03") {
    return res.status(503).json({
      success: false,
      error: "Database unavailable, please try again",
      code: "DB_ERROR"
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || "INTERNAL_ERROR"
  });
};

module.exports = errorHandler;
