import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.calendarEvent.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const data = await req.json();
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.location !== undefined) updateData.location = data.location?.trim() || null;
    if (data.source !== undefined) updateData.source = data.source;

    const updated = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.calendarEvent.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    await prisma.calendarEvent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
