import { Request, Response, NextFunction } from 'express';

// ─── Global error handler middleware ─────────────────────────────────────────
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[GlobalError]', err.stack ?? err.message);
  res.status(500).json({ error: 'Lỗi server không xác định', details: err.message });
}

// ─── 404 handler ──────────────────────────────────────────────────────────────
export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Route không tồn tại: ${req.method} ${req.originalUrl}` });
}
