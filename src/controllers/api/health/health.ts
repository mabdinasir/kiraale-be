import db from '@db';
import { sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const health: RequestHandler = async (_request, response) => {
  try {
    // Check database connectivity
    const startTime = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbResponseTime = Date.now() - startTime;

    // Get server uptime
    const uptime = process.uptime();

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    response.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        database: {
          status: 'healthy',
          responseTime: `${dbResponseTime}ms`,
        },
        server: {
          status: 'healthy',
          uptime: `${Math.floor(uptime)}s`,
          memory: {
            used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          },
        },
      },
      environment: process.env.NODE_ENV ?? 'development',
      version: '1.0.0',
    });
  } catch (error) {
    response.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: (error as Error).message,
      checks: {
        database: {
          status: 'unhealthy',
          error: 'Database connection failed',
        },
        server: {
          status: 'healthy',
          uptime: `${Math.floor(process.uptime())}s`,
        },
      },
      environment: process.env.NODE_ENV ?? 'development',
      version: '1.0.0',
    });
  }
};

export default health;
