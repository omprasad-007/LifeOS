'use client';

import React, { useState } from 'react';
import { CalendarEventItem } from '@/types';

interface CalendarViewProps {
  events: CalendarEventItem[];
  onRefreshData: () => void;
  onOpenQuickCreate: () => void;
}

export default function CalendarView({
  events,
  onRefreshData,
  onOpenQuickCreate,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const today = new Date();

  // Matrix cells
  const calendarCells = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(year, month, day));
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
      setSelectedEvent(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-24 pt-2 md:pt-4">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {monthName}
          </h1>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={handlePrev}
              className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={handleNext}
              className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        <button
          onClick={onOpenQuickCreate}
          className="hidden md:flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/25 hover:opacity-95 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Event</span>
        </button>
      </div>

      {/* Month Calendar Matrix Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-y-3 gap-x-1">
          {calendarCells.map((cellDate, idx) => {
            if (!cellDate) {
              return <div key={`empty-${idx}`} className="h-10 w-10 mx-auto" />;
            }

            const isToday = isSameDay(cellDate, today);
            const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), cellDate));
            const hasEvent = dayEvents.length > 0;

            return (
              <div
                key={cellDate.toISOString()}
                className={`flex flex-col items-center justify-center h-10 w-10 mx-auto text-xs font-semibold relative transition-all rounded-2xl cursor-pointer ${
                  isToday
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {cellDate.getDate()}
                {hasEvent && (
                  <div
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      isToday ? 'bg-white' : 'bg-indigo-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Agenda</h2>
          <span className="text-xs text-slate-500 font-medium">
            {events.length} total events
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            No events scheduled
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev, idx) => {
              const colorBars = ['bg-indigo-600', 'bg-purple-600', 'bg-amber-500'];
              const barColor = colorBars[idx % colorBars.length];

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex gap-4 items-start cursor-pointer group"
                >
                  <div className={`w-1.5 h-12 ${barColor} rounded-full shrink-0`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {ev.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(ev.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {ev.location ? ` • ${ev.location}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                {selectedEvent.source} Event
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {selectedEvent.title}
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                {new Date(selectedEvent.startTime).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                •{' '}
                {new Date(selectedEvent.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                –{' '}
                {new Date(selectedEvent.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {selectedEvent.location && <p>📍 {selectedEvent.location}</p>}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete Event
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
