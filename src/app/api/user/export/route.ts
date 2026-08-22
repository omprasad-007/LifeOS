import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [tasks, notes, reminders, calendarEvents, documents] = await Promise.all([
      prisma.task.findMany({ where: { userId: user.id } }),
      prisma.note.findMany({ where: { userId: user.id } }),
      prisma.reminder.findMany({ where: { userId: user.id } }),
      prisma.calendarEvent.findMany({ where: { userId: user.id } }),
      prisma.document.findMany({ where: { userId: user.id } }),
    ]);

    const exportData = {
      exportMetadata: {
        appName: 'LifeOS V1',
        exportedAt: new Date().toISOString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          timezone: user.timezone,
          studyHoursStart: user.studyHoursStart,
          studyHoursEnd: user.studyHoursEnd,
          joinedAt: user.createdAt,
        },
      },
      tasks,
      notes: notes.map((n) => ({
        ...n,
        tags: (() => {
          try {
            return JSON.parse(n.tags);
          } catch {
            return [];
          }
        })(),
      })),
      reminders,
      calendarEvents,
      documents: documents.map((d) => ({
        ...d,
        tags: (() => {
          try {
            return JSON.parse(d.tags);
          } catch {
            return [];
          }
        })(),
      })),
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lifeos-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
