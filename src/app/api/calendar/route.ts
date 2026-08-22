import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    const whereClause: any = { userId: user.id };

    if (startParam && endParam) {
      whereClause.OR = [
        {
          startTime: {
            gte: new Date(startParam),
            lte: new Date(endParam),
          },
        },
        {
          endTime: {
            gte: new Date(startParam),
            lte: new Date(endParam),
          },
        },
      ];
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    if (!data.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!data.startTime || !data.endTime) {
      return NextResponse.json({ error: 'Start and end time are required' }, { status: 400 });
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime < startTime) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: data.title.trim(),
        startTime,
        endTime,
        source: data.source || 'manual',
        location: data.location?.trim() || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
