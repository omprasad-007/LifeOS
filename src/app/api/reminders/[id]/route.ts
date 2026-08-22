import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.reminder.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });

    const data = await req.json();
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.remindAt !== undefined) updateData.remindAt = new Date(data.remindAt);
    if (data.isRecurring !== undefined) updateData.isRecurring = Boolean(data.isRecurring);
    if (data.recurrenceRule !== undefined) updateData.recurrenceRule = data.recurrenceRule;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await prisma.reminder.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.reminder.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });

    await prisma.reminder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
