'use client';

import React, { useState } from 'react';
import { TaskItem, Priority, TaskStatus } from '@/types';

interface TasksViewProps {
  tasks: TaskItem[];
  onRefreshData: () => void;
  onOpenQuickCreate: () => void;
}

export default function TasksView({ tasks, onRefreshData, onOpenQuickCreate }: TasksViewProps) {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('MEDIUM');
  const [editStatus, setEditStatus] = useState<TaskStatus>('TODO');
  const [editProgress, setEditProgress] = useState(0);
  const [editEstHours, setEditEstHours] = useState(1.0);
  const [editDueDate, setEditDueDate] = useState('');

  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.status === 'DONE';
    if (filter === 'today') {
      if (t.status === 'DONE') return false;
      if (t.dueDate && new Date(t.dueDate) > endOfToday) return false;
    }
    if (filter === 'upcoming') {
      if (t.status === 'DONE') return false;
      if (!t.dueDate || new Date(t.dueDate) <= endOfToday) return false;
    }
    return true;
  });

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

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditProgress(task.progressPercent);
    setEditEstHours(task.estimatedHours);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc || null,
          priority: editPriority,
          status: editStatus,
          progressPercent: Number(editProgress),
          estimatedHours: Number(editEstHours),
          dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        }),
      });
      setIsEditModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      onRefreshData();
      if (isEditModalOpen) setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const aiFeaturedTask = filteredTasks.find((t) => t.priority === 'HIGH' && t.status !== 'DONE') || filteredTasks[0];
  const standardTasks = filteredTasks.filter((t) => t.id !== aiFeaturedTask?.id);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-24 pt-2 md:pt-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tasks &amp; Focus
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize, prioritize, and track your deliverables
          </p>
        </div>

        <button
          onClick={onOpenQuickCreate}
          className="hidden md:flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/25 hover:opacity-95 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {[
          { id: 'all', label: `All Tasks (${tasks.length})` },
          { id: 'today', label: 'Today' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: `Completed (${tasks.filter((t) => t.status === 'DONE').length})` },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === item.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Featured Task Card */}
        {aiFeaturedTask && (
          <article className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-lg shadow-indigo-500/10 md:col-span-2 lg:col-span-2 flex flex-col justify-between gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => handleToggleTaskStatus(aiFeaturedTask)}
                  className={`w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    aiFeaturedTask.status === 'DONE' ? 'bg-indigo-600' : ''
                  }`}
                >
                  {aiFeaturedTask.status === 'DONE' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </button>
                <div>
                  <h3 className={`text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors ${aiFeaturedTask.status === 'DONE' ? 'line-through opacity-50' : ''}`}>
                    {aiFeaturedTask.title}
                  </h3>
                  {aiFeaturedTask.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {aiFeaturedTask.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                  {aiFeaturedTask.priority}
                </span>
                <button
                  onClick={() => handleOpenEdit(aiFeaturedTask)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Progress: {aiFeaturedTask.progressPercent}%</span>
                <span>{aiFeaturedTask.dueDate ? `Due ${new Date(aiFeaturedTask.dueDate).toLocaleDateString()}` : `~${aiFeaturedTask.estimatedHours}h est.`}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                  style={{ width: `${aiFeaturedTask.progressPercent}%` }}
                />
              </div>
            </div>
          </article>
        )}

        {/* Standard Task Cards */}
        {standardTasks.map((task) => (
          <article
            key={task.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 flex-1">
                <button
                  onClick={() => handleToggleTaskStatus(task)}
                  className={`w-5 h-5 rounded-full border-2 ${
                    task.priority === 'HIGH' ? 'border-red-400' : task.priority === 'MEDIUM' ? 'border-amber-400' : 'border-emerald-400'
                  } flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    task.status === 'DONE' ? 'bg-indigo-600 border-indigo-600' : ''
                  }`}
                >
                  {task.status === 'DONE' && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>
                <div>
                  <h4 className={`text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors ${task.status === 'DONE' ? 'line-through opacity-50' : ''}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(task)}
                className="p-1 text-slate-300 hover:text-indigo-600 opacity-60 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  task.priority === 'HIGH'
                    ? 'bg-red-50 text-red-600'
                    : task.priority === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {task.priority}
              </span>
              <span className="text-[11px] text-slate-400">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Edit Task</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Progress: {editProgress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="w-full accent-indigo-600 mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(editingTask.id)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Delete Task
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
