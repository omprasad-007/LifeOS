'use client';

import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  userEmail = '',
  userName = '',
}: FeedbackModalProps) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [category, setCategory] = useState<'FEATURE_REQUEST' | 'BUG' | 'GENERAL' | 'PRAISE'>('GENERAL');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || userName,
          email: email || userEmail,
          category,
          rating,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  const mailtoUrl = `mailto:shreyash9552@gmail.com?subject=${encodeURIComponent(
    `[LifeOS Feedback] [${category}] from ${name || 'User'}`
  )}&body=${encodeURIComponent(
    `Rating: ${rating}/5 Stars\nCategory: ${category}\nUser: ${name || 'Anonymous'} (${email || 'No email provided'})\n\nMessage:\n${message}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[36px] material-symbols-filled">
                check_circle
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Thank You for Your Feedback!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your input has been received and routed directly to the engineering team at <span className="font-bold text-indigo-600">shreyash9552@gmail.com</span>.
              </p>
            </div>

            <div className="pt-3 flex flex-wrap gap-2 justify-center">
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                Open Email Client (Optional)
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                  onClose();
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[24px] material-symbols-filled">
                  rate_review
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Share Your Feedback
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Help us make LifeOS better. Submissions are delivered directly to <span className="font-semibold text-indigo-600">shreyash9552@gmail.com</span>.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  How would you rate your experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-125 active:scale-95 ${
                        star <= rating ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-500 ml-2">
                    {rating === 5 ? 'Amazing! 🚀' : rating === 4 ? 'Great 👍' : rating === 3 ? 'Good 🙂' : rating === 2 ? 'Fair 😐' : 'Needs Work ⚠️'}
                  </span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'GENERAL', label: 'General', icon: 'chat' },
                    { id: 'FEATURE_REQUEST', label: 'Feature', icon: 'lightbulb' },
                    { id: 'BUG', label: 'Bug Report', icon: 'bug_report' },
                    { id: 'PRAISE', label: 'Praise', icon: 'favorite' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        category === cat.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email (Optional/Prefilled) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Om Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="om@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Message / Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what features you'd like to see or what we can improve..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-slate-600">shreyash9552@gmail.com</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>{loading ? 'Sending...' : 'Send Feedback'}</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
