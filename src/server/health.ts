import { version as pkgVersion } from "../../package.json";

export type HealthStatus = "ok" | "degraded" | "unavailable";

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
}

export function getHealthStatus(): HealthResponse {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: pkgVersion,
  };
}
