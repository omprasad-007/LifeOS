import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { confirmation } = await req.json();
    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Please type DELETE to confirm.' }, { status: 400 });
    }

    // Cascade delete user and all associated records
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true, message: 'Account deleted permanently.' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
