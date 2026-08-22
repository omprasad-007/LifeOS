import Anthropic from '@anthropic-ai/sdk';
import { AIDayPlanResponse, AIScheduleBlock, Priority } from '@/types';

interface TaskInput {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  progressPercent: number;
  estimatedHours: number;
  dueDate?: string | Date | null;
}

interface CalendarSlotInput {
  title: string;
  startTime: string | Date;
  endTime: string | Date;
}

export async function generateDayPlanWithAI({
  tasks,
  studyHoursStart,
  studyHoursEnd,
  calendarEvents,
  timezone,
}: {
  tasks: TaskInput[];
  studyHoursStart: string;
  studyHoursEnd: string;
  calendarEvents: CalendarSlotInput[];
  timezone: string;
}): Promise<AIDayPlanResponse> {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

  const promptContext = {
    timezone,
    studyHours: { start: studyHoursStart, end: studyHoursEnd },
    calendarConflictsToday: calendarEvents.map((c) => ({
      title: c.title,
      start: new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end: new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
    incompleteTasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      progressPercent: `${t.progressPercent}%`,
      estimatedHours: t.estimatedHours,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : 'None',
    })),
  };

  const systemPrompt = `You are LifeOS AI, an intelligent personal productivity executive assistant.
Your goal is to optimize the user's daily schedule by allocating their incomplete tasks into structured, realistic time blocks within their study/work hours, avoiding calendar conflicts.

RULES:
1. Always prioritize HIGH priority tasks earlier in the day when energy is highest.
2. Consider task estimated hours and existing progress percentage.
3. Fit schedule strictly inside study hours (${studyHoursStart} to ${studyHoursEnd}), leaving short 5-10 min breaks between heavy sessions.
4. Output STRICT JSON ONLY matching this format:
{
  "summary": "Brief 1-2 sentence high-level executive summary of today's focus strategy.",
  "schedule": [
    {
      "taskId": "task-id-if-available",
      "taskTitle": "Task title",
      "suggestedStartTime": "09:00 AM",
      "suggestedDurationMinutes": 60,
      "reasoning": "Single clear sentence explaining why this task is scheduled at this specific slot."
    }
  ]
}`;

  // 1. Try OpenRouter (GPT-4o-mini / Claude / DeepSeek)
  if (openRouterKey && openRouterKey.startsWith('sk-or-')) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://lifeos.local',
          'X-Title': 'LifeOS V1',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here is my current context for today. Please plan my day:\n${JSON.stringify(promptContext, null, 2)}` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              summary: parsed.summary || 'Optimized daily schedule created using OpenRouter AI.',
              schedule: parsed.schedule || [],
              generatedAt: new Date().toISOString(),
              isFallback: false,
            };
          }
        }
      }
    } catch (err) {
      console.warn('OpenRouter AI call failed, trying next provider:', err);
    }
  }

  // 2. Try Groq (Ultra-fast LLM inference)
  if (groqKey && groqKey.startsWith('gsk_')) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'groq/compound-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here is my current context for today. Please plan my day:\n${JSON.stringify(promptContext, null, 2)}` },
          ],
          temperature: 0.2,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              summary: parsed.summary || 'Optimized daily schedule created using Groq AI.',
              schedule: parsed.schedule || [],
              generatedAt: new Date().toISOString(),
              isFallback: false,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Groq AI call failed, falling back:', err);
    }
  }

  // 3. Try Direct Anthropic Claude SDK
  if (anthropicKey && anthropicKey.startsWith('sk-ant')) {
    try {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Here is my current context for today. Please plan my day:\n${JSON.stringify(promptContext, null, 2)}`,
          },
        ],
      });

      const firstBlock = response.content[0];
      if (firstBlock.type === 'text') {
        const text = firstBlock.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary || 'Optimized daily schedule created using Anthropic Claude.',
            schedule: parsed.schedule || [],
            generatedAt: new Date().toISOString(),
            isFallback: false,
          };
        }
      }
    } catch (err) {
      console.warn('Anthropic API call failed, falling back to rule-based engine:', err);
    }
  }

  // 4. Smart Rule-based Planning Engine Fallback
  return generateRuleBasedSchedule({ tasks, studyHoursStart, studyHoursEnd, calendarEvents });
}

function generateRuleBasedSchedule({
  tasks,
  studyHoursStart,
  studyHoursEnd,
  calendarEvents,
}: {
  tasks: TaskInput[];
  studyHoursStart: string;
  studyHoursEnd: string;
  calendarEvents: CalendarSlotInput[];
}): AIDayPlanResponse {
  const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const sortedTasks = [...tasks].sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    if (pDiff !== 0) return pDiff;
    return (a.progressPercent || 0) - (b.progressPercent || 0);
  });

  const [startH, startM] = studyHoursStart.split(':').map((n) => parseInt(n, 10) || 0);
  const [endH, endM] = studyHoursEnd.split(':').map((n) => parseInt(n, 10) || 0);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const schedule: AIScheduleBlock[] = [];

  for (const task of sortedTasks) {
    if (currentMinutes >= endMinutes) break;

    const remainingFraction = Math.max(0.2, (100 - (task.progressPercent || 0)) / 100);
    const durationMinutes = Math.min(
      120,
      Math.max(30, Math.round((task.estimatedHours || 1) * remainingFraction * 60))
    );

    const slotStartH = Math.floor(currentMinutes / 60);
    const slotStartM = currentMinutes % 60;
    const timeString = formatTimeDisplay(slotStartH, slotStartM);

    let reason = '';
    if (task.priority === 'HIGH') {
      reason = 'High priority deadline tackled during peak morning focus window.';
    } else if (task.progressPercent > 50) {
      reason = `Nearly complete (${task.progressPercent}%) — quick push will close it out.`;
    } else {
      reason = 'Balanced focus block scheduled within available afternoon study hours.';
    }

    schedule.push({
      taskId: task.id,
      taskTitle: task.title,
      suggestedStartTime: timeString,
      suggestedDurationMinutes: durationMinutes,
      reasoning: reason,
      priority: (task.priority as Priority) || 'MEDIUM',
    });

    currentMinutes += durationMinutes + 15;
  }

  return {
    summary: `Structured ${schedule.length} high-impact focus blocks within your ${studyHoursStart}–${studyHoursEnd} study window, prioritized by urgency and remaining effort.`,
    schedule,
    generatedAt: new Date().toISOString(),
    isFallback: true,
  };
}

function formatTimeDisplay(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const mStr = minutes.toString().padStart(2, '0');
  return `${h12}:${mStr} ${period}`;
}
