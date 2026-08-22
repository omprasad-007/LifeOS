'use client';

import React, { useState } from 'react';
import { ReminderItem } from '@/types';

interface RemindersViewProps {
  reminders: ReminderItem[];
  onRefreshData: () => void;
  onOpenQuickCreate: () => void;
}

export default function RemindersView({
  reminders,
  onRefreshData,
  onOpenQuickCreate,
}: RemindersViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'pending') return r.status === 'PENDING';
    if (filter === 'completed') return r.status === 'COMPLETED';
    return true;
  });

  const handleToggleStatus = async (reminder: ReminderItem) => {
    const newStatus = reminder.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;
    try {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-lg pb-32 md:pb-lg pt-xs md:pt-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display-greeting text-display-greeting text-primary font-semibold">
            Reminders & Alerts
          </h1>
          <p className="font-body-sm text-secondary mt-0.5">
            Never miss a sync, standup, review, or habit
          </p>
        </div>

        <button
          onClick={onOpenQuickCreate}
          className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm text-label-sm shadow-sm hover:opacity-90 active:scale-95 transition-all font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-sm">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all font-medium ${
            filter === 'all'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          All ({reminders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all font-medium ${
            filter === 'pending'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Pending ({reminders.filter((r) => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all font-medium ${
            filter === 'completed'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Completed ({reminders.filter((r) => r.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-surface-variant text-secondary text-sm">
          No reminders found in this view
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {filteredReminders.map((reminder) => {
            const isPast = new Date(reminder.remindAt).getTime() < Date.now();
            const isCompleted = reminder.status === 'COMPLETED';

            return (
              <div
                key={reminder.id}
                className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between gap-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-sm">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => handleToggleStatus(reminder)}
                    className="checkbox-custom flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-body-md text-body-md font-semibold text-on-surface ${
                        isCompleted ? 'task-checked' : ''
                      }`}
                    >
                      {reminder.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-secondary text-xs mt-1">
                      <span className="material-symbols-outlined text-[14px]">
                        {reminder.isRecurring ? 'autorenew' : 'alarm'}
                      </span>
                      <span>
                        {new Date(reminder.remindAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {reminder.isRecurring && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded font-label-caps text-[10px] font-semibold tracking-wider">
                        {reminder.recurrenceRule || 'RECURRING'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-1 text-secondary hover:text-error opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                {!isCompleted && isPast && (
                  <div className="mt-2 text-[11px] text-error font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Overdue
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
