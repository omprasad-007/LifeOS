'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
        <span className="material-symbols-outlined text-[32px]">error_outline</span>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-slate-500 max-w-sm mb-6 text-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-all"
      >
        Return to LifeOS Home →
      </Link>
    </div>
  );
}
