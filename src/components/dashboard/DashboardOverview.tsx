'use client';

import React, { useState, useEffect } from 'react';
import { TaskItem, CalendarEventItem, ReminderItem, AIDayPlanResponse, Priority } from '@/types';

interface DashboardOverviewProps {
  onOpenQuickCreate: (tab?: 'task' | 'note' | 'reminder' | 'calendar' | 'document') => void;
  onNavigate: (tab: string) => void;
  onRefreshData: () => void;
  tasks: TaskItem[];
  events: CalendarEventItem[];
  reminders: ReminderItem[];
  userStudyHours: { start: string; end: string };
  userName: string;
}

export default function DashboardOverview({
  onOpenQuickCreate,
  onNavigate,
  onRefreshData,
  tasks,
  events,
  reminders,
  userStudyHours,
  userName,
}: DashboardOverviewProps) {
  const [aiPlan, setAiPlan] = useState<AIDayPlanResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [expandedReasonings, setExpandedReasonings] = useState<Record<number, boolean>>({});
  const [todayString, setTodayString] = useState('');

  useEffect(() => {
    const d = new Date();
    setTodayString(d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }));
  }, []);

  const handlePlanMyDay = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/plan-day', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate daily AI plan');
      const data = await res.json();
      setAiPlan(data);
    } catch (err: any) {
      setAiError(err.message || 'Error generating daily plan');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleReasoning = (index: number) => {
    setExpandedReasonings((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const newProgress = newStatus === 'DONE' ? 100 : task.progressPercent;

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, progressPercent: newProgress }),
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const todayPriorities = [...tasks]
    .filter((t) => t.status !== 'DONE')
    .sort((a, b) => (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1))
    .slice(0, 5);

  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-24 pt-2 md:pt-4">
      {/* Top Greeting */}
      <div className="md:col-span-12 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, {userName}! 👋
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {todayString} • Focus window {userStudyHours.start} – {userStudyHours.end}
          </p>
        </div>

        <button
          onClick={() => onRefreshData()}
          className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          title="Refresh Data"
        >
          <span className="material-symbols-outlined text-[20px]">sync</span>
        </button>
      </div>

      {/* Main Content Area (Left 8 Cols on desktop) */}
      <div className="md:col-span-8 flex flex-col gap-6">
        {/* Quick Action Scroll Bar */}
        <section className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-1">
          <button
            onClick={() => onOpenQuickCreate('task')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-full flex-shrink-0 text-slate-700 hover:text-indigo-700 font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-600">add</span>
            <span>+ Task</span>
          </button>
          <button
            onClick={() => onOpenQuickCreate('note')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-full flex-shrink-0 text-slate-700 hover:text-indigo-700 font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-600">add</span>
            <span>+ Note</span>
          </button>
          <button
            onClick={() => onOpenQuickCreate('reminder')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-full flex-shrink-0 text-slate-700 hover:text-indigo-700 font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-600">add</span>
            <span>+ Reminder</span>
          </button>
          <button
            onClick={() => onOpenQuickCreate('calendar')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-full flex-shrink-0 text-slate-700 hover:text-indigo-700 font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-600">add</span>
            <span>+ Event</span>
          </button>
          <button
            onClick={() => onOpenQuickCreate('document')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-full flex-shrink-0 text-slate-700 hover:text-indigo-700 font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-600">add</span>
            <span>+ Document</span>
          </button>
        </section>

        {/* AI Suggestion Banner Card (From Screenshot) */}
        <section className="ai-card-gradient rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-100 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  AI Suggestion
                </span>
                <span className="material-symbols-outlined text-[16px] text-indigo-200">
                  auto_awesome
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                You have 2.5 free hours tonight. Start your high-priority items with autonomous scheduling?
              </h3>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Calculates conflict-free time slots based on your registered calendar and tasks.
              </p>
            </div>

            <button
              onClick={handlePlanMyDay}
              disabled={aiLoading}
              className="px-5 py-2.5 bg-white text-indigo-700 font-bold text-xs rounded-xl shadow-lg hover:bg-indigo-50 active:scale-95 transition-all self-start sm:self-center flex-shrink-0 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {aiLoading ? 'sync' : 'auto_awesome'}
              </span>
              <span>{aiLoading ? 'Reasoning...' : aiPlan ? 'Re-Plan Day' : 'View Plan'}</span>
            </button>
          </div>

          {/* AI Plan Schedule Drawer */}
          {aiPlan && (
            <div className="mt-5 pt-4 border-t border-white/20 space-y-3 animate-fadeIn">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs text-white">
                <span className="font-bold">Strategy: </span>
                {aiPlan.summary}
              </div>

              <div className="space-y-2">
                {aiPlan.schedule.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-2xl text-slate-800 flex items-center justify-between text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px]">
                        {slot.suggestedStartTime}
                      </span>
                      <span className="font-semibold text-slate-900">{slot.taskTitle}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {slot.suggestedDurationMinutes} mins
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Today's Priorities */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900">Today&apos;s Priorities</h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
            >
              See All
            </button>
          </div>

          {todayPriorities.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              All priorities completed! 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {todayPriorities.map((task) => {
                let ringColor = 'border-emerald-400';
                let tagColor = 'text-emerald-600 bg-emerald-50';
                let tagText = 'Normal Priority';

                if (task.priority === 'HIGH') {
                  ringColor = 'border-red-400';
                  tagColor = 'text-red-600 bg-red-50';
                  tagText = task.dueDate ? 'Due Soon' : 'High Priority';
                } else if (task.priority === 'MEDIUM') {
                  ringColor = 'border-amber-400';
                  tagColor = 'text-amber-600 bg-amber-50';
                  tagText = 'In Progress';
                }

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`w-5 h-5 rounded-full border-2 ${ringColor} flex items-center justify-center transition-all ${
                          task.status === 'DONE' ? 'bg-indigo-600 border-indigo-600' : ''
                        }`}
                      >
                        {task.status === 'DONE' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </button>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </h4>
                        {task.dueDate && (
                          <p className="text-[11px] text-slate-400">
                            Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>
                      {tagText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar (Right 4 Cols) */}
      <div className="md:col-span-4 flex flex-col gap-6">
        {/* Upcoming Events */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-900">Upcoming Events</h3>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
            >
              View Calendar
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming events</p>
            ) : (
              upcomingEvents.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition-all"
                >
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{ev.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(ev.startTime).toLocaleDateString(undefined, { weekday: 'short' })},{' '}
                      {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Smart Insights Pill */}
        <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[20px] material-symbols-filled">
              psychology
            </span>
            <h4 className="font-bold text-xs text-slate-900">Smart Knowledge Search</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Search across your documents, notes, and calendar events instantaneously with semantic memory.
          </p>
          <button
            onClick={() => onNavigate('notes')}
            className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Open Notes &amp; Search →
          </button>
        </section>
      </div>
    </div>
  );
}
