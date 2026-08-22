'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone Mockup Interactive State
  const [phoneTasks, setPhoneTasks] = useState([
    { id: '1', title: 'DBMS Assignment', tag: 'Due Tomorrow', color: 'text-red-500', ringColor: 'border-red-400', checked: false },
    { id: '2', title: 'Project Work', tag: 'In Progress', color: 'text-amber-500', ringColor: 'border-amber-400', checked: false },
    { id: '3', title: 'Read 10 Pages', tag: 'Personal Growth', color: 'text-emerald-500', ringColor: 'border-emerald-400', checked: true },
  ]);

  const [aiPlanAccepted, setAiPlanAccepted] = useState(false);

  // Landing AI Playground State
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundPlan, setPlaygroundPlan] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setPhoneTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error);
      } else if (res?.ok) {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.error || 'Registration failed');
      }

      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setAuthMode('signin');
        setError('Account created! Please sign in.');
      } else if (res?.ok) {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: 'demo@lifeos.local',
        password: 'password123',
        redirect: false,
      });

      if (res?.error) {
        setError('Failed to log in with demo account. Initializing demo...');
        // Auto-register demo account if needed
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Om Sharma', email: 'demo@lifeos.local', password: 'password123' }),
        });
        const retryRes = await signIn('credentials', {
          email: 'demo@lifeos.local',
          password: 'password123',
          redirect: false,
        });
        if (retryRes?.ok) {
          window.location.href = '/';
          return;
        }
      } else if (res?.ok) {
        window.location.href = '/';
        return;
      }
    } catch (err) {
      setError('Error connecting to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const triggerPlayground = () => {
    setPlaygroundLoading(true);
    setTimeout(() => {
      setPlaygroundPlan(
        'AI Schedule Created: Focus Block 1 (9:30 AM - 11:00 AM: Deep Architecture), Break (15m), Focus Block 2 (2:00 PM - 3:30 PM: DBMS & Code Review).'
      );
      setPlaygroundLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600 flex flex-col justify-between">
      {/* Background Soft Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] bg-indigo-100/70 rounded-full blur-[150px] -top-40 -left-40 animate-pulse-glow" />
        <div className="absolute w-[700px] h-[700px] bg-purple-100/60 rounded-full blur-[140px] top-1/3 -right-40 animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-2xl">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V15C19 13.8954 18.1046 13 17 13H11V5C11 3.89543 10.1046 3 9 3H7Z" />
              </svg>
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                LifeOS
              </span>
              <span className="ml-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                by AnOS
              </span>
            </div>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-base font-semibold text-slate-600">
            <a href="#hero" className="text-indigo-600 relative py-1 border-b-2 border-indigo-600">
              Home
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#ai-demo" className="hover:text-slate-900 transition-colors">
              AI Reasoner
            </a>
            <a href="#company" className="hover:text-slate-900 transition-colors">
              About AnOS
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-100 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setIsAuthModalOpen(true); }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:opacity-95 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Suite */}
      <main className="relative z-10 w-full flex-1 flex flex-col gap-24 py-10">
        {/* Section 1: Hero Section (Matching Exact User Reference Image) */}
        <section id="hero" className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading, Subtitle & CTAs */}
            <div className="lg:col-span-5 flex flex-col gap-7">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-sm font-bold self-start shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-indigo-600 material-symbols-filled">
                  auto_awesome
                </span>
                <span>Your Life. Organized. Intelligently.</span>
              </div>

              {/* Giant Title */}
              <div className="space-y-1">
                <h1 className="font-display text-6xl sm:text-7xl font-black tracking-tight text-indigo-600">
                  LifeOS
                </h1>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                  Your AI-Powered <br />
                  Life Assistant
                </h2>
              </div>

              {/* Description */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl font-normal">
                LifeOS brings your tasks, notes, schedules, documents, finances and more — together in one intelligent workspace that understands you.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => { setAuthMode('signup'); setIsAuthModalOpen(true); }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:opacity-95 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Get Started for Free</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>

                <button
                  onClick={handleDemoLogin}
                  className="px-7 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-base shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px] text-indigo-600 material-symbols-filled">
                    play_arrow
                  </span>
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {['alex', 'sarah', 'om', 'elena'].map((user, i) => (
                    <div
                      key={i}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-sm font-black flex items-center justify-center shadow-md uppercase"
                    >
                      {user[0]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-slate-600 font-semibold">
                  Trusted by 10,000+ users to simplify their everyday life
                </span>
              </div>
            </div>

            {/* Center Column: 3D Phone Mockup */}
            <div className="lg:col-span-4 flex justify-center items-center py-4">
              <div className="phone-mockup scale-[0.95] sm:scale-100 transition-transform">
                <div className="phone-island" />

                {/* Status Bar */}
                <div className="px-6 pt-3 pb-2 flex justify-between items-center text-xs font-bold text-slate-800 z-40">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[14px]">wifi</span>
                    <span className="material-symbols-outlined text-[16px]">battery_full</span>
                  </div>
                </div>

                {/* Phone App Content */}
                <div className="flex-1 px-4 py-2 overflow-y-auto hide-scrollbar space-y-3.5 bg-slate-50/50">
                  {/* Greeting */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Good Morning, Om! 👋</h3>
                      <p className="text-[11px] text-slate-500">Tuesday, 21 May</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <span className="material-symbols-outlined text-[18px]">sync</span>
                    </button>
                  </div>

                  {/* Today's Priorities */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Today&apos;s Priorities
                    </span>
                    <div className="space-y-1.5">
                      {phoneTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => toggleTask(t.id)}
                          className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 px-1 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${t.ringColor} flex items-center justify-center ${
                                t.checked ? 'bg-indigo-600 border-indigo-600' : ''
                              }`}
                            >
                              {t.checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className={`text-xs font-semibold text-slate-800 ${t.checked ? 'line-through opacity-50' : ''}`}>
                              {t.title}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold ${t.color}`}>{t.tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestion Card */}
                  <div className="ai-card-gradient rounded-2xl p-3.5 text-white relative overflow-hidden shadow-lg shadow-indigo-500/25">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                        AI Suggestion
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-indigo-200">
                        auto_awesome
                      </span>
                    </div>
                    <p className="text-xs font-semibold leading-snug text-white max-w-[190px]">
                      You have 2.5 free hours tonight. Start your DBMS assignment at 7:30 PM?
                    </p>
                    <button
                      onClick={() => setAiPlanAccepted(true)}
                      className="mt-2.5 px-3 py-1 bg-white text-indigo-700 rounded-full font-bold text-[10px] shadow-sm hover:bg-indigo-50 transition-colors"
                    >
                      {aiPlanAccepted ? '✓ Plan Scheduled' : 'View Plan'}
                    </button>

                    <div className="absolute right-1 bottom-1 w-14 h-14 opacity-90 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                        <span className="material-symbols-outlined text-[28px] material-symbols-filled">
                          smart_toy
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Upcoming Events
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 cursor-pointer">
                        View Calendar
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">Project Meeting</p>
                          <p className="text-[10px] text-slate-500">Tomorrow, 2:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <div className="p-1.5 rounded-lg bg-red-50 text-red-600 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">event</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">DBMS Assignment Due</p>
                          <p className="text-[10px] text-slate-500">Thursday, 11:59 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Bottom Nav Bar */}
                <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex justify-between items-center z-40">
                  <button className="flex flex-col items-center text-indigo-600">
                    <span className="material-symbols-outlined text-[18px] material-symbols-filled">home</span>
                    <span className="text-[9px] font-bold">Home</span>
                  </button>
                  <button className="flex flex-col items-center text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">check_box</span>
                    <span className="text-[9px] font-medium">Tasks</span>
                  </button>
                  <button
                    onClick={handleDemoLogin}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                  <button className="flex flex-col items-center text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                    <span className="text-[9px] font-medium">Notes</span>
                  </button>
                  <button className="flex flex-col items-center text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="text-[9px] font-medium">Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: 5 Feature Nodes */}
            <div className="lg:col-span-3 flex flex-col gap-3 justify-center">
              {/* Card 1: Tasks */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[24px] material-symbols-filled">
                    check_box
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Tasks</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Organize and prioritize what matters.
                  </p>
                </div>
              </div>

              {/* Card 2: Schedule */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[24px] material-symbols-filled">
                    calendar_month
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Schedule</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    All your events and deadlines in one place.
                  </p>
                </div>
              </div>

              {/* Card 3: Documents */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[24px] material-symbols-filled">
                    description
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Documents</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Store, find and get reminders for important docs.
                  </p>
                </div>
              </div>

              {/* Card 4: Finances */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[24px] material-symbols-filled">
                    wallet
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Finances</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Track spending and get smart insights.
                  </p>
                </div>
              </div>

              {/* Card 5: AI Assistant */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[24px] material-symbols-filled">
                    auto_awesome
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">AI Assistant</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Get personalized suggestions and intelligent help.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bento Feature Bar */}
          <div className="w-full mt-12 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">grid_view</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">All-in-One Dashboard</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  See your day at a glance with everything that matters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">psychology</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">AI That Understands You</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Smart suggestions tailored to your habits and goals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Secure &amp; Private</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your data is encrypted and always under your control.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">devices</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Works Everywhere</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Access LifeOS on web, mobile and desktop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Features Deep Dive */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 pt-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-black text-indigo-600 bg-indigo-50 inline-block px-4 py-1.5 rounded-full border border-indigo-100">
              Powerful Core Features
            </h2>
            <h3 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Designed to eliminate cognitive friction.
            </h3>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Every tool inside LifeOS connects to the AnOS reasoning engine to automate daily micro-decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[30px] material-symbols-filled">auto_awesome</span>
              </div>
              <h4 className="font-display text-xl font-bold text-slate-900">Autonomous Day Planner</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connects directly to your calendars and pending tasks to allocate realistic focus blocks with transparent reasoning.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[30px] material-symbols-filled">check_circle</span>
              </div>
              <h4 className="font-display text-xl font-bold text-slate-900">Bento Priorities Matrix</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visual hierarchy for your most critical deliverables with progress bars, due alerts, and friction-free status toggles.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[30px] material-symbols-filled">psychology</span>
              </div>
              <h4 className="font-display text-xl font-bold text-slate-900">Semantic Notes &amp; Memory</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search across all your meetings, documents, and thoughts instantaneously without relying on exact keyword matches.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive AI Playground Section */}
        <section id="ai-demo" className="w-full max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-4xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-2xl space-y-4 relative z-10">
              <span className="text-xs uppercase font-black text-indigo-400 bg-indigo-500/20 px-3.5 py-1.5 rounded-full border border-indigo-400/30">
                AnOS Intelligence Engine
              </span>
              <h3 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Try the AI Reasoner right now.
              </h3>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Click below to simulate how LifeOS balances study hours, upcoming deadlines, and calendar blocks into an optimal timeline.
              </p>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <button
                  onClick={triggerPlayground}
                  disabled={playgroundLoading}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/40 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {playgroundLoading ? 'sync' : 'auto_awesome'}
                  </span>
                  <span>{playgroundLoading ? 'Calculating optimal blocks...' : 'Simulate Day Plan'}</span>
                </button>

                <button
                  onClick={handleDemoLogin}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md transition-all"
                >
                  Open Full Demo Workspace →
                </button>
              </div>

              {playgroundPlan && (
                <div className="mt-6 p-5 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md text-sm text-indigo-200 leading-relaxed animate-fadeIn">
                  <span className="font-bold text-white">AnOS Output: </span>
                  {playgroundPlan}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Direct Auth Section on Page */}
        <section id="auth-section" className="w-full max-w-xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-display text-3xl font-black text-slate-900 tracking-tight">
                {authMode === 'signin' ? 'Welcome Back to LifeOS' : 'Create Your LifeOS Account'}
              </h3>
              <p className="text-sm text-slate-500">
                {authMode === 'signin' ? 'Enter your email or use 1-click demo access' : 'Start organizing your productivity with AnOS'}
              </p>
            </div>

            {/* Quick 1-Click Demo Login Highlight Card */}
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  Instant Preview
                </span>
                <span className="text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                  1-Click Access
                </span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full mt-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                {loading ? 'Launching LifeOS...' : 'Launch Demo Workspace'}
              </button>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                Or Continue With Email
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {error && (
              <div className="p-3 text-xs font-semibold bg-red-50 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Om Sharma"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="om@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-98 transition-all"
              >
                {loading
                  ? 'Authenticating...'
                  : authMode === 'signin'
                  ? 'Sign In to LifeOS'
                  : 'Create LifeOS Account'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                }}
                className="text-sm text-indigo-600 font-bold hover:underline"
              >
                {authMode === 'signin'
                  ? "Don't have an account? Sign up for free"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Rich Multi-Column AnOS Footer */}
      <footer id="company" className="relative z-20 w-full bg-white border-t border-slate-200 pt-16 pb-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200">
          {/* Company Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V15C19 13.8954 18.1046 13 17 13H11V5C11 3.89543 10.1046 3 9 3H7Z" />
                </svg>
              </div>
              <span className="font-display text-2xl font-black text-slate-900 tracking-tight">
                AnOS
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-sm">
              LifeOS is engineered and built by <span className="font-bold text-slate-900">AnOS Technologies Inc.</span> — building the next generation of autonomous human productivity systems.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full self-start inline-flex border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All Systems Operational • AnOS Core 1.0</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase font-black tracking-wider text-slate-900">Product</h4>
            <ul className="space-y-2 text-sm font-semibold text-slate-600">
              <li><a href="#hero" className="hover:text-indigo-600 transition-colors">LifeOS Dashboard</a></li>
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">AI Reasoner</a></li>
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">Priority Bento</a></li>
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">Calendar Sync</a></li>
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">Notes &amp; Memory</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase font-black tracking-wider text-slate-900">Resources</h4>
            <ul className="space-y-2 text-sm font-semibold text-slate-600">
              <li><a href="#ai-demo" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
              <li><a href="#ai-demo" className="hover:text-indigo-600 transition-colors">API Architecture</a></li>
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">Privacy Model</a></li>
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">OpenRouter &amp; Groq AI</a></li>
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase font-black tracking-wider text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm font-semibold text-slate-600">
              <li><a href="#company" className="hover:text-indigo-600 transition-colors">About AnOS</a></li>
              <li><a href="#company" className="hover:text-indigo-600 transition-colors">Careers</a></li>
              <li><a href="#company" className="hover:text-indigo-600 transition-colors">Press Kit</a></li>
              <li><a href="#company" className="hover:text-indigo-600 transition-colors">Contact AnOS</a></li>
              <li><a href="#company" className="hover:text-indigo-600 transition-colors">Security Audit</a></li>
            </ul>
          </div>

          {/* Column 5: Stay Updated */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase font-black tracking-wider text-slate-900">Stay Updated</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Get the latest AI planning features delivered straight to your inbox.
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="email"
                placeholder="Enter email..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
              <button
                onClick={() => alert('Subscribed to AnOS newsletter!')}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 <strong>AnOS Inc.</strong> All rights reserved.</span>
            <span>•</span>
            <span>Made with ❤️ by <strong>AnOS</strong></span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 cursor-pointer">Security Overview</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Pop-up option) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4 relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="text-center space-y-1 pt-2">
              <h3 className="font-display text-2xl font-black text-slate-900">
                {authMode === 'signin' ? 'Welcome Back to LifeOS' : 'Create Your LifeOS Account'}
              </h3>
              <p className="text-xs text-slate-500">
                {authMode === 'signin' ? 'Enter your credentials to continue' : 'Start organizing your day with AnOS'}
              </p>
            </div>

            {/* Quick 1-Click Demo Action */}
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Instant Preview
                </span>
                <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                  1-Click Access
                </span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full mt-1 py-2.5 px-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                {loading ? 'Entering...' : 'Enter Demo Workspace Directly'}
              </button>
            </div>

            <div className="flex items-center my-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Or Continue With Email
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl font-bold">
                {error}
              </div>
            )}

            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Om Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="om@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition-all"
              >
                {loading
                  ? 'Please wait...'
                  : authMode === 'signin'
                  ? 'Sign In to LifeOS'
                  : 'Create LifeOS Account'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                {authMode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
