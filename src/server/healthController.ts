import { Request, Response } from 'express';
import { getHealthStatus } from './health';

/**
 * GET /health
 * Returns the current health status of the service.
 *
 * @example Success response (200):
 * {
 *   "status": "ok",
 *   "timestamp": "2026-04-30T16:00:00.000Z",
 *   "uptime": 42.5,
 *   "version": "1.0.0"
 * }
 */
export function healthCheckHandler(req: Request, res: Response): void {
  const health = getHealthStatus();
  const httpStatus = health.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(health);
}
