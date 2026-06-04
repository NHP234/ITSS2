// ─── Global error handler ────────────────────────────────────────────────────
function errorHandler(err, _req, res, _next) {
  console.error('[GlobalError]', err.stack ?? err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.statusCode ? err.message : 'Lỗi server không xác định',
    details: err.message
  });
}

// ─── 404 handler ─────────────────────────────────────────────────────────────
function notFound(req, res) {
  res.status(404).json({
    error: `Route không tồn tại: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
