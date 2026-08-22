import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateDayPlanWithAI } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Fetch incomplete tasks for the user
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: { not: 'DONE' },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    // 2. Fetch today's calendar events
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        userId: user.id,
        startTime: { gte: startOfToday, lte: endOfToday },
      },
      orderBy: { startTime: 'asc' },
    });

    // 3. Generate plan using Anthropic Claude with intelligent rule-based fallback
    const plan = await generateDayPlanWithAI({
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        progressPercent: t.progressPercent,
        estimatedHours: t.estimatedHours,
        dueDate: t.dueDate,
      })),
      studyHoursStart: user.studyHoursStart || '09:00',
      studyHoursEnd: user.studyHoursEnd || '17:00',
      calendarEvents: calendarEvents.map((c) => ({
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
      })),
      timezone: user.timezone || 'UTC',
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error generating day plan:', error);
    return NextResponse.json({ error: 'Failed to generate day plan' }, { status: 500 });
  }
}
