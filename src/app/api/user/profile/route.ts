import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      studyHoursStart: user.studyHoursStart,
      studyHoursEnd: user.studyHoursEnd,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name?.trim() || null;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.studyHoursStart !== undefined) updateData.studyHoursStart = data.studyHoursStart;
    if (data.studyHoursEnd !== undefined) updateData.studyHoursEnd = data.studyHoursEnd;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        studyHoursStart: true,
        studyHoursEnd: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
