import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase().trim();
    const tag = searchParams.get('tag')?.toLowerCase().trim();

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { updatedAt: 'desc' },
    });

    let filtered = notes.map((n) => ({
      ...n,
      tags: (() => {
        try {
          return JSON.parse(n.tags);
        } catch {
          return [];
        }
      })(),
    }));

    if (tag) {
      filtered = filtered.filter((n) =>
        n.tags.some((t: string) => t.toLowerCase() === tag)
      );
    }

    if (search) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.content.toLowerCase().includes(search) ||
          n.tags.some((t: string) => t.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching notes:', error);
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

    const tagsArray = Array.isArray(data.tags)
      ? data.tags.map((t: string) => t.trim().replace(/^#/, ''))
      : [];

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: data.title.trim(),
        content: data.content || '',
        tags: JSON.stringify(tagsArray),
      },
    });

    return NextResponse.json(
      {
        ...note,
        tags: tagsArray,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
