import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const note = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    return NextResponse.json({
      ...note,
      tags: (() => {
        try {
          return JSON.parse(note.tags);
        } catch {
          return [];
        }
      })(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    const data = await req.json();
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) {
      const tagsArray = Array.isArray(data.tags)
        ? data.tags.map((t: string) => t.trim().replace(/^#/, ''))
        : [];
      updateData.tags = JSON.stringify(tagsArray);
    }

    const updated = await prisma.note.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      tags: (() => {
        try {
          return JSON.parse(updated.tags);
        } catch {
          return [];
        }
      })(),
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
