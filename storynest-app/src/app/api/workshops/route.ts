import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Workshop } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const workshops = await Workshop.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: workshops.length, workshops });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
