'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import TasksView from '@/components/tasks/TasksView';
import NotesView from '@/components/notes/NotesView';
import RemindersView from '@/components/reminders/RemindersView';
import CalendarView from '@/components/calendar/CalendarView';
import DocumentsView from '@/components/documents/DocumentsView';
import SettingsView from '@/components/settings/SettingsView';
import QuickCreateModal from '@/components/modals/QuickCreateModal';
import {
  TaskItem,
  NoteItem,
  ReminderItem,
  CalendarEventItem,
  DocumentItem,
  UserProfile,
} from '@/types';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateDefaultTab, setQuickCreateDefaultTab] = useState<
    'task' | 'note' | 'reminder' | 'calendar' | 'document'
  >('task');

  // Application Data States
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  // Fetch all user scoped data
  const fetchData = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      const [
        tasksRes,
        notesRes,
        remindersRes,
        calendarRes,
        docsRes,
        profileRes,
      ] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/notes'),
        fetch('/api/reminders'),
        fetch('/api/calendar'),
        fetch('/api/documents'),
        fetch('/api/user/profile'),
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
      if (remindersRes.ok) setReminders(await remindersRes.json());
      if (calendarRes.ok) setCalendarEvents(await calendarRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (profileRes.ok) setUserProfile(await profileRes.json());
    } catch (err) {
      console.error('Error loading LifeOS dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenQuickCreate = (
    tab: 'task' | 'note' | 'reminder' | 'calendar' | 'document' = 'task'
  ) => {
    setQuickCreateDefaultTab(tab);
    setIsQuickCreateOpen(true);
  };

  if (status === 'loading' || (loading && status === 'authenticated')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-md" />
          <div className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Loading LifeOS by AnOS...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onOpenQuickCreate={handleOpenQuickCreate}
      reminders={reminders}
      onRefreshData={fetchData}
    >
      {currentTab === 'dashboard' && (
        <DashboardOverview
          onOpenQuickCreate={handleOpenQuickCreate}
          onNavigate={setCurrentTab}
          onRefreshData={fetchData}
          tasks={tasks}
          events={calendarEvents}
          reminders={reminders}
          userStudyHours={{
            start: userProfile?.studyHoursStart || '09:00',
            end: userProfile?.studyHoursEnd || '17:00',
          }}
          userName={userProfile?.name || session?.user?.name || 'Thinker'}
        />
      )}

      {currentTab === 'tasks' && (
        <TasksView
          tasks={tasks}
          onRefreshData={fetchData}
          onOpenQuickCreate={() => handleOpenQuickCreate('task')}
        />
      )}

      {currentTab === 'notes' && (
        <NotesView
          notes={notes}
          onRefreshData={fetchData}
          onOpenQuickCreate={() => handleOpenQuickCreate('note')}
        />
      )}

      {currentTab === 'reminders' && (
        <RemindersView
          reminders={reminders}
          onRefreshData={fetchData}
          onOpenQuickCreate={() => handleOpenQuickCreate('reminder')}
        />
      )}

      {currentTab === 'calendar' && (
        <CalendarView
          events={calendarEvents}
          onRefreshData={fetchData}
          onOpenQuickCreate={() => handleOpenQuickCreate('calendar')}
        />
      )}

      {currentTab === 'documents' && (
        <DocumentsView
          documents={documents}
          onRefreshData={fetchData}
          onOpenQuickCreate={() => handleOpenQuickCreate('document')}
        />
      )}

      {currentTab === 'settings' && userProfile && (
        <SettingsView userProfile={userProfile} onProfileUpdated={fetchData} />
      )}

      {/* Global Quick Create Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        defaultTab={quickCreateDefaultTab}
        onCreated={fetchData}
      />
    </AppShell>
  );
}
