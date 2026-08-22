import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const task = await prisma.task.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const data = await req.json();
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'DONE' && existing.progressPercent < 100) {
        updateData.progressPercent = 100;
      }
    }
    if (data.progressPercent !== undefined) {
      const progress = Math.min(100, Math.max(0, Number(data.progressPercent)));
      updateData.progressPercent = progress;
      if (progress === 100) {
        updateData.status = 'DONE';
      } else if (progress > 0 && existing.status === 'TODO') {
        updateData.status = 'IN_PROGRESS';
      }
    }
    if (data.estimatedHours !== undefined) {
      updateData.estimatedHours = Math.max(0.25, Number(data.estimatedHours));
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
