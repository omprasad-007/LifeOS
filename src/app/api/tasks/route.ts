import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'today' | 'upcoming' | 'completed' | 'all'
    const priority = searchParams.get('priority');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const whereClause: any = {
      userId: user.id,
    };

    if (priority) {
      whereClause.priority = priority;
    }

    if (filter === 'today') {
      whereClause.status = { not: 'DONE' };
      whereClause.OR = [
        { dueDate: { lte: endOfToday } },
        { dueDate: null },
      ];
    } else if (filter === 'upcoming') {
      whereClause.status = { not: 'DONE' };
      whereClause.dueDate = { gt: endOfToday };
    } else if (filter === 'completed') {
      whereClause.status = 'DONE';
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    if (!data.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || 'MEDIUM',
        progressPercent: typeof data.progressPercent === 'number' ? Math.min(100, Math.max(0, data.progressPercent)) : 0,
        estimatedHours: typeof data.estimatedHours === 'number' ? Math.max(0.25, data.estimatedHours) : 1.0,
        status: data.status || 'TODO',
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
