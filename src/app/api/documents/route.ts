import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = documents.map((doc) => ({
      ...doc,
      tags: (() => {
        try {
          return JSON.parse(doc.tags);
        } catch {
          return [];
        }
      })(),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    if (!data.fileName?.trim()) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const tagsArray = Array.isArray(data.tags)
      ? data.tags.map((t: string) => t.trim().replace(/^#/, ''))
      : [];

    const doc = await prisma.document.create({
      data: {
        userId: user.id,
        fileName: data.fileName.trim(),
        fileUrl: data.fileUrl || `https://storage.local/docs/${encodeURIComponent(data.fileName.trim())}`,
        extractedText: data.extractedText || null,
        tags: JSON.stringify(tagsArray),
      },
    });

    return NextResponse.json(
      {
        ...doc,
        tags: tagsArray,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
