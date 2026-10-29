import { NextResponse } from 'next/server';
import { isTestingAuthorized } from '@/lib/testingAuth';
import { connectToDatabase } from '@/lib/mongodb';
import {
  User,
  ChildProfile,
  Book,
  Manuscript,
  Workshop,
  Quiz,
  Notification,
  WebsiteSetting,
} from '@/models';

export async function GET() {
  try {
    const authorized = await isTestingAuthorized();
    if (!authorized) {
      return NextResponse.json({ error: 'Testing Phase authorization required' }, { status: 403 });
    }

    const startTime = Date.now();
    const conn = await connectToDatabase();
    const latency = Date.now() - startTime;

    // Check replica set status & topology
    let replicaSetName = 'Unknown';
    let hosts: string[] = [];
    try {
      const isMasterResult = await conn.connection.db?.admin().command({ isMaster: 1 });
      replicaSetName = isMasterResult?.setName || 'Standard Cluster';
      hosts = isMasterResult?.hosts || [];
    } catch {
      // fallback
    }

    const [
      usersCount,
      childrenCount,
      booksCount,
      manuscriptsCount,
      workshopsCount,
      quizzesCount,
      notificationsCount,
      settingsCount,
    ] = await Promise.all([
      User.countDocuments(),
      ChildProfile.countDocuments(),
      Book.countDocuments(),
      Manuscript.countDocuments(),
      Workshop.countDocuments(),
      Quiz.countDocuments(),
      Notification.countDocuments(),
      WebsiteSetting.countDocuments(),
    ]);

    const activeSetting = await WebsiteSetting.findOne().lean();

    return NextResponse.json({
      success: true,
      database: {
        status: 'Connected',
        provider: 'MongoDB Atlas Cloud',
        dbName: conn.connection.name,
        replicaSet: replicaSetName,
        shardHosts: hosts,
        latencyMs: latency,
        sslEnabled: true,
      },
      counts: {
        users: usersCount,
        children: childrenCount,
        books: booksCount,
        manuscripts: manuscriptsCount,
        workshops: workshopsCount,
        quizzes: quizzesCount,
        notifications: notificationsCount,
        settings: settingsCount,
      },
      permissions: {
        allowCertificateGeneration: activeSetting?.allowCertificateGeneration ?? true,
        enablePublishingPortal: activeSetting?.enablePublishingPortal ?? true,
        maintenanceMode: activeSetting?.maintenanceMode ?? false,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Database connection error' }, { status: 500 });
  }
}
