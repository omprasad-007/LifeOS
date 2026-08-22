'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { UserProfile } from '@/types';

interface SettingsViewProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
}

export default function SettingsView({ userProfile, onProfileUpdated }: SettingsViewProps) {
  const [name, setName] = useState(userProfile.name || '');
  const [timezone, setTimezone] = useState(userProfile.timezone || 'UTC');
  const [studyHoursStart, setStudyHoursStart] = useState(userProfile.studyHoursStart || '09:00');
  const [studyHoursEnd, setStudyHoursEnd] = useState(userProfile.studyHoursEnd || '17:00');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          timezone,
          studyHoursStart,
          studyHoursEnd,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setSaveSuccess(true);
      onProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/user/export');
      if (!res.ok) throw new Error('Failed to export data');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText !== 'DELETE') return;

    setDeleting(true);
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      if (!res.ok) throw new Error('Failed to delete account');
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const initialLetter = (userProfile.name || userProfile.email || 'O').charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-7xl mx-auto pt-2 md:pt-4 pb-24 flex flex-col gap-6">
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-4xl sm:text-5xl flex items-center justify-center shadow-xl shadow-indigo-500/25 border-4 border-white select-none">
          {initialLetter}
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
          {userProfile.name || 'Om Sharma'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {userProfile.email}
        </p>

        <div className="mt-3 bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-indigo-100">
          <span className="material-symbols-outlined text-[16px] text-indigo-600 material-symbols-filled">
            check_circle
          </span>
          Active focus mode ({studyHoursStart} – {studyHoursEnd})
        </div>
      </section>

      {/* Grid: Settings Form & Connected Apps */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            Account &amp; Focus Parameters
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Study Start Time
                </label>
                <input
                  type="time"
                  value={studyHoursStart}
                  onChange={(e) => setStudyHoursStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Study End Time
                </label>
                <input
                  type="time"
                  value={studyHoursEnd}
                  onChange={(e) => setStudyHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 font-bold">
                  ✓ Saved successfully
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Applied to AI daily scheduler immediately
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                {saving ? 'Saving...' : 'Save Parameters'}
              </button>
            </div>
          </form>

          {/* Export & Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {exporting ? 'Exporting...' : 'Export JSON Dump'}
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              Delete Account
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="ml-auto px-4 py-2 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Connected Apps */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Connected Integrations
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Centralize your workflows with real-time bidirectional syncing.
          </p>

          <div className="space-y-3 pt-2">
            {/* Google Workspace */}
            <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-600">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Google Workspace</h4>
                  <span className="text-[10px] text-emerald-600 font-bold">CONNECTED</span>
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            {/* Apple Calendar */}
            <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-white opacity-80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Apple Calendar</h4>
                  <span className="text-[10px] text-slate-400 font-bold">COMING SOON</span>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-white opacity-80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">WhatsApp Assistant</h4>
                  <span className="text-[10px] text-slate-400 font-bold">COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-red-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-red-600">
              Permanent Account Deletion
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will erase all tasks, notes, and calendar events for <span className="font-bold text-slate-800">{userProfile.email}</span>.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || deleteConfirmationText !== 'DELETE'}
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-600 disabled:opacity-40 rounded-xl shadow-md"
                >
                  {deleting ? 'Deleting...' : 'Delete Everything'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
