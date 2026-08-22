'use client';

import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { ReminderItem } from '@/types';

interface AppShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickCreate: (tab?: 'task' | 'note' | 'reminder' | 'calendar' | 'document') => void;
  children: React.ReactNode;
  reminders: ReminderItem[];
  onRefreshData: () => void;
}

export default function AppShell({
  currentTab,
  onTabChange,
  onOpenQuickCreate,
  children,
  reminders,
  onRefreshData,
}: AppShellProps) {
  const { data: session } = useSession();
  const [dueNotification, setDueNotification] = useState<ReminderItem | null>(null);

  // In-app Reminder Polling & Due Alert Detection
  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date().getTime();
      const due = reminders.find(
        (r) => r.status === 'PENDING' && new Date(r.remindAt).getTime() <= now
      );

      if (due && due.id !== dueNotification?.id) {
        setDueNotification(due);
      }
    };

    checkDueReminders();
    const interval = setInterval(checkDueReminders, 15000);
    return () => clearInterval(interval);
  }, [reminders, dueNotification]);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'tasks', label: 'Tasks', icon: 'check_box' },
    { id: 'notes', label: 'Notes', icon: 'description' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    { id: 'reminders', label: 'Reminders', icon: 'notifications' },
    { id: 'settings', label: 'Profile', icon: 'person' },
  ];

  const handleDismissReminderToast = async (markDone = false) => {
    if (!dueNotification) return;
    if (markDone) {
      try {
        await fetch(`/api/reminders/${dueNotification.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' }),
        });
        onRefreshData();
      } catch (err) {
        console.error(err);
      }
    }
    setDueNotification(null);
  };

  const userName = session?.user?.name?.split(' ')[0] || 'Om';

  return (
    <div className="bg-[#f8fafc] text-slate-900 font-sans antialiased min-h-screen flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600 pb-[88px] md:pb-0 pt-[72px] md:pt-[84px]">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto h-[72px] md:h-[84px]">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onTabChange('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold text-xl cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V15C19 13.8954 18.1046 13 17 13H11V5C11 3.89543 10.1046 3 9 3H7Z" />
              </svg>
            </div>
            <span
              onClick={() => onTabChange('dashboard')}
              className="text-2xl font-bold tracking-tight text-slate-900 cursor-pointer"
            >
              LifeOS
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'material-symbols-filled' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick Action Button on Desktop */}
            <button
              onClick={() => onOpenQuickCreate('task')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/25 hover:opacity-95 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create</span>
            </button>

            {/* Desktop Avatar Trailing with First Letter */}
            <div
              onClick={() => onTabChange('settings')}
              className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md select-none ring-2 ring-indigo-200"
              title={`Profile & Settings (${userName})`}
            >
              {userName.charAt(0).toUpperCase() || 'O'}
            </div>
          </nav>

          {/* Mobile Right Quick Action */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => onTabChange('settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm"
            >
              {userName.charAt(0).toUpperCase() || 'O'}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {children}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => onOpenQuickCreate('task')}
        className="md:hidden fixed bottom-[84px] right-5 z-40 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white w-13 h-13 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/40 active:scale-95 duration-200 p-3.5"
        aria-label="Add new item"
      >
        <span className="material-symbols-outlined text-[26px]">add</span>
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-lg">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 duration-200 ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span
                className={`material-symbols-outlined mb-0.5 text-[22px] ${
                  isActive ? 'material-symbols-filled' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* In-App Due Reminder Banner */}
      {dueNotification && (
        <div className="fixed bottom-24 right-4 z-50 max-w-sm w-[calc(100%-32px)] bg-white border-2 border-indigo-500/40 rounded-3xl shadow-2xl p-4 flex items-start gap-3 animate-bounce">
          <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 flex-shrink-0">
            <span className="material-symbols-outlined text-[22px] material-symbols-filled">
              notifications_active
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Reminder Due
              </span>
              <button
                onClick={() => handleDismissReminderToast(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">
              {dueNotification.title}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {new Date(dueNotification.remindAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => handleDismissReminderToast(true)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-all"
              >
                Mark Done
              </button>
              <button
                onClick={() => handleDismissReminderToast(false)}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs hover:bg-slate-200 transition-all font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
