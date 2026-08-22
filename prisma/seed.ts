import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LifeOS database...');

  // Upsert demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@lifeos.local' },
    update: {
      passwordHash,
      name: 'Alex Mercer',
      studyHoursStart: '09:00',
      studyHoursEnd: '18:00',
      timezone: 'America/New_York',
    },
    create: {
      email: 'demo@lifeos.local',
      name: 'Alex Mercer',
      passwordHash,
      timezone: 'America/New_York',
      studyHoursStart: '09:00',
      studyHoursEnd: '18:00',
    },
  });

  console.log(`Demo user created/updated with ID: ${user.id}`);

  // Clear existing demo records to allow clean re-seed
  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.note.deleteMany({ where: { userId: user.id } });
  await prisma.reminder.deleteMany({ where: { userId: user.id } });
  await prisma.calendarEvent.deleteMany({ where: { userId: user.id } });
  await prisma.document.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Seed Tasks
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Review Q3 Product Architecture & API Specs',
        description: 'Complete the distributed cache review and verify payload schemas with the infra team.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        progressPercent: 65,
        estimatedHours: 2.5,
        dueDate: new Date(today.getTime() + 18 * 60 * 60 * 1000), // Today 6 PM
      },
      {
        userId: user.id,
        title: 'Submit LifeOS V1 Prototype to Beta Users',
        description: 'Publish release build and notify the first cohort of early testers.',
        priority: 'HIGH',
        status: 'TODO',
        progressPercent: 30,
        estimatedHours: 1.5,
        dueDate: new Date(today.getTime() + 20 * 60 * 60 * 1000), // Today 8 PM
      },
      {
        userId: user.id,
        title: 'Refactor Auth Middleware & Token Rotation',
        description: 'Ensure session refresh tokens rotate cleanly without UI stutter.',
        priority: 'MEDIUM',
        status: 'TODO',
        progressPercent: 10,
        estimatedHours: 3.0,
        dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 * 2), // 2 days later
      },
      {
        userId: user.id,
        title: 'Deep Dive: Distributed Database Sharding Paper',
        description: 'Read and take structured notes on consensus mechanisms for partitioned stores.',
        priority: 'MEDIUM',
        status: 'TODO',
        progressPercent: 0,
        estimatedHours: 2.0,
        dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 * 3),
      },
      {
        userId: user.id,
        title: 'Organize Workspace & Cloud Drive Backups',
        description: 'Archive stale projects from last quarter to cold storage.',
        priority: 'LOW',
        status: 'DONE',
        progressPercent: 100,
        estimatedHours: 1.0,
        dueDate: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      },
    ],
  });

  // 2. Seed Notes
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: 'System Design: Real-time Event Ingestion',
        content: `### Core Components\n- **Ingestion Gateway**: Fast HTTP layer with token-bucket rate limiting.\n- **Message Broker**: Partitioned pub/sub queue with 7-day retention.\n- **Storage Engine**: Append-only timeseries columnar store for instant aggregations.\n\n*Key takeaway*: Always decouple ingestion from downstream indexing to prevent backpressure spikes.`,
        tags: JSON.stringify(['architecture', 'systems', 'engineering']),
      },
      {
        userId: user.id,
        title: 'Weekly Focus & Mindset Notes',
        content: `1. Keep the main goal the main goal: Ship fast, iterate based on real feedback.\n2. Dedicate 9am - 12pm strictly to deep focus work (no Slack, no email).\n3. Review daily AI schedule recommendations every morning over coffee.`,
        tags: JSON.stringify(['habits', 'productivity']),
      },
      {
        userId: user.id,
        title: 'Anthropic Claude Prompting Best Practices',
        content: `When building structured AI planning:\n- Use strict JSON schemas with schema descriptions in prompt.\n- Provide explicit contextual boundaries (working hours, fixed calendar events).\n- Ask for concise 'reasoning' fields to build user trust.`,
        tags: JSON.stringify(['ai', 'llm', 'research']),
      },
    ],
  });

  // 3. Seed Reminders
  await prisma.reminder.createMany({
    data: [
      {
        userId: user.id,
        title: 'Hydration & Posture Check',
        remindAt: new Date(Date.now() + 15 * 60 * 1000), // In 15 mins
        isRecurring: true,
        recurrenceRule: 'HOURLY',
        status: 'PENDING',
      },
      {
        userId: user.id,
        title: 'Call Accountant regarding Q3 filings',
        remindAt: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4 PM today
        isRecurring: false,
        status: 'PENDING',
      },
      {
        userId: user.id,
        title: 'Daily Evening Standup & Debrief',
        remindAt: new Date(today.getTime() + 17.5 * 60 * 60 * 1000), // 5:30 PM today
        isRecurring: true,
        recurrenceRule: 'DAILY',
        status: 'PENDING',
      },
    ],
  });

  // 4. Seed Calendar Events
  await prisma.calendarEvent.createMany({
    data: [
      {
        userId: user.id,
        title: 'Engineering Sprint Sync',
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000),   // 11:00 AM
        source: 'manual',
        location: 'Google Meet',
      },
      {
        userId: user.id,
        title: 'Design Review: LifeOS V1 Dashboard',
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),   // 3:00 PM
        source: 'manual',
        location: 'Conference Room B',
      },
      {
        userId: user.id,
        title: 'Product Roadmap Planning',
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // Tomorrow 11 AM
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 12.5 * 60 * 60 * 1000),
        source: 'google',
        location: 'Zoom Room #4',
      },
    ],
  });

  // 5. Seed Documents
  await prisma.document.createMany({
    data: [
      {
        userId: user.id,
        fileName: 'LifeOS_System_Architecture_V1.pdf',
        fileUrl: 'https://storage.googleapis.com/lifeos-demo/docs/architecture.pdf',
        extractedText: 'LifeOS V1 System Blueprint: Next.js App Router, Prisma ORM, Anthropic Claude 3.5 Sonnet Integration, Role Based Access & Strict Scope Isolation.',
        tags: JSON.stringify(['architecture', 'specs']),
      },
      {
        userId: user.id,
        fileName: 'Q3_Product_Goals_and_OKRs.pdf',
        fileUrl: 'https://storage.googleapis.com/lifeos-demo/docs/q3_okrs.pdf',
        extractedText: 'Key Objectives: 1. Launch LifeOS V1 to 500 alpha users. 2. Maintain < 500ms API response time. 3. Achieve 85% daily planning AI acceptance rate.',
        tags: JSON.stringify(['product', 'okrs']),
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
