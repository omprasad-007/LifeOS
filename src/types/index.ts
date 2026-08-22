export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type ReminderStatus = 'PENDING' | 'COMPLETED' | 'DISMISSED';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  timezone: string;
  studyHoursStart: string;
  studyHoursEnd: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: Priority;
  progressPercent: number;
  estimatedHours: number;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[]; // parsed from JSON
  createdAt: string;
  updatedAt: string;
}

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  remindAt: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  status: ReminderStatus;
  createdAt: string;
}

export interface CalendarEventItem {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  source: string;
  location: string | null;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  extractedText: string | null;
  tags: string[];
  createdAt: string;
}

export interface AIScheduleBlock {
  taskTitle: string;
  suggestedStartTime: string;
  suggestedDurationMinutes: number;
  reasoning: string;
  priority?: Priority;
  taskId?: string;
}

export interface AIDayPlanResponse {
  summary: string;
  schedule: AIScheduleBlock[];
  generatedAt: string;
  isFallback?: boolean;
}
