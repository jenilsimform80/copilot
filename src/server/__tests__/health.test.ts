import { Request, Response } from 'express';
import { healthCheckHandler } from '../healthController';
import { getHealthStatus, HealthResponse } from '../health';

jest.mock('../health');

const mockGetHealthStatus = getHealthStatus as jest.MockedFunction<typeof getHealthStatus>;

function makeRes(): { status: jest.Mock; json: jest.Mock } {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const baseHealth: HealthResponse = {
  status: 'ok',
  timestamp: '2026-04-30T16:00:00.000Z',
  uptime: 42,
  version: '1.0.0',
};

describe('GET /health', () => {
  const req = {} as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and health payload when status is ok', () => {
    mockGetHealthStatus.mockReturnValue(baseHealth);
    const res = makeRes();

    healthCheckHandler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(baseHealth);
  });

  it('returns 503 when status is degraded', () => {
    mockGetHealthStatus.mockReturnValue({ ...baseHealth, status: 'degraded' });
    const res = makeRes();

    healthCheckHandler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('returns 503 when status is unavailable', () => {
    mockGetHealthStatus.mockReturnValue({ ...baseHealth, status: 'unavailable' });
    const res = makeRes();

    healthCheckHandler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('includes all required fields in the response body', () => {
    mockGetHealthStatus.mockReturnValue(baseHealth);
    const res = makeRes();

    healthCheckHandler(req, res as unknown as Response);

    const body: HealthResponse = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('version');
  });
});
