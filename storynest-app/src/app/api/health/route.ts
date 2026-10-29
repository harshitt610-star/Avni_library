import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;

  try {
    const conn = await connectToDatabase();
    if (conn.connection.readyState === 1 && conn.connection.db) {
      const pingStart = Date.now();
      await conn.connection.db.command({ ping: 1 });
      dbLatencyMs = Date.now() - pingStart;
      dbStatus = 'connected';
    } else {
      dbStatus = 'connecting';
    }
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  const memory = process.memoryUsage();
  const isHealthy = dbStatus === 'connected';

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      poolSize: mongoose.connection.readyState === 1 ? 'active' : 'idle',
    },
    system: {
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production',
    },
    totalResponseTimeMs: Date.now() - startTime,
  };

  return NextResponse.json(healthData, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

