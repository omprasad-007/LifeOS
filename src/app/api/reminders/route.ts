import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      orderBy: { remindAt: 'asc' },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
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

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        title: data.title.trim(),
        remindAt: data.remindAt ? new Date(data.remindAt) : new Date(Date.now() + 60 * 60 * 1000),
        isRecurring: Boolean(data.isRecurring),
        recurrenceRule: data.recurrenceRule || (data.isRecurring ? 'DAILY' : null),
        status: data.status || 'PENDING',
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
