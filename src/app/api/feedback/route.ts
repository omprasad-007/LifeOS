import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category, rating, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Save to Database
    const feedback = await (prisma as any).feedback.create({
      data: {
        name: name?.trim() || null,
        email: email?.trim() || null,
        category: category || 'GENERAL',
        rating: Number(rating) || 5,
        message: message.trim(),
      },
    });

    console.log(`[FEEDBACK RECEIVED] Routed to shreyash9552@gmail.com:`, {
      from: email || 'Anonymous',
      name: name || 'User',
      category,
      rating,
      message,
    });

    return NextResponse.json({
      success: true,
      data: feedback,
      recipient: 'shreyash9552@gmail.com',
      message: 'Feedback submitted successfully! Thank you for helping improve LifeOS.',
    });
  } catch (err: any) {
    console.error('Error submitting feedback:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feedbacks = await (prisma as any).feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(feedbacks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch feedback' }, { status: 500 });
  }
}
