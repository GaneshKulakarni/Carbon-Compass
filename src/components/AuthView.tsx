import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cloud, Lock, Mail, User as UserIcon, RefreshCw, KeyRound, Sparkles, Smile } from 'lucide-react';

interface AuthViewProps {
  onSuccessTab?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessTab = 'dashboard' }) => {
  const { 
    signUpEmail, 
    signInEmail, 
    signInWithGoogle,
    authError, 
    authLoading,
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [localError, setLocalError] = useState('');

  const isOperationNotAllowed = authError?.includes('operation-not-allowed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!authEmail.trim() || !authPassword.trim()) {
      setLocalError('Please fill out all required fields.');
      return;
    }

    if (authPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (authMode === 'register') {
        if (!authName.trim()) {
          setLocalError('Name is required to register.');
          return;
        }
        await signUpEmail(authEmail.trim(), authPassword, authName.trim());
      } else {
        await signInEmail(authEmail.trim(), authPassword);
      }
    } catch (err) {
      console.error("Auth flow error: ", err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Decorative premium background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-forest-500/10 dark:bg-forest-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl border border-stone-200/60 bg-white/75 p-8 shadow-xl backdrop-blur-md dark:border-stone-850 dark:bg-stone-900/85 z-10 transition-all">
        
        {/* Brand Callout */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-forest-600 text-white shadow-md shadow-forest-600/20">
            <Cloud className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-stone-900 dark:text-stone-50">
            {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-stone-450 max-w-xs mx-auto leading-relaxed">
            {authMode === 'login' 
              ? 'Log in to securely restore and synchronize your carbon dashboard, habits, and daily trackers.' 
              : 'Register to unlock your personal carbon footprint ledger, community hubs, and premium AI features.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-6 dark:bg-stone-955 border border-stone-200/40 dark:border-stone-850/50">
          <button 
            id="btn-gate-tab-login"
            type="button"
            onClick={() => { setAuthMode('login'); setLocalError(''); }}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-white' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
          >
            Sign In
          </button>
          <button 
            id="btn-gate-tab-register"
            type="button"
            onClick={() => { setAuthMode('register'); setLocalError(''); }}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'register' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-white' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
          >
            Create Account
          </button>
        </div>

        {/* Errors Block */}
        {(localError || authError) && (
          <div className="mb-4 space-y-3">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-150/60 dark:bg-rose-955/20 dark:border-rose-900/30 text-xs text-rose-800 dark:text-rose-350 font-semibold animate-shake flex flex-col gap-2">
              <span className="font-bold flex items-center gap-1">
                <span>⚠️</span>
                <span>{localError || authError}</span>
              </span>
              
              {isOperationNotAllowed && (
                <div className="mt-1.5 pt-2 border-t border-rose-200/50 dark:border-rose-900/20 text-[11px] font-medium text-stone-600 dark:text-stone-300 space-y-2 leading-relaxed">
                  <p className="font-bold text-stone-800 dark:text-stone-200">
                    Why did this happen?
                  </p>
                  <p>
                    By default, new Firebase projects only have <strong>Google Sign-In</strong> enabled. The "Email and Password" provider is currently turned off in your Firebase Console settings.
                  </p>
                  <div className="bg-white/80 p-2.5 rounded-lg dark:bg-stone-950/40 space-y-1 text-[10.5px]">
                    <p className="font-bold text-emerald-800 dark:text-emerald-400">🔧 How to enable Email & Password registration:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" className="underline text-emerald-600 hover:text-emerald-700" rel="noreferrer">Firebase Console</a> and open your project.</li>
                      <li>In the left sidebar, click <strong>Authentication</strong>, then select the <strong>Sign-in method</strong> tab.</li>
                      <li>Click <strong>Add new provider</strong>, select <strong>Email/Password</strong>, turn the toggle to <strong>Enabled</strong>, and hit <strong>Save</strong>.</li>
                    </ol>
                  </div>
                  <p className="italic text-stone-550 dark:text-stone-400">
                    Alternatively, you can skip this entirely by clicking the <strong>Continue with Google</strong> button below which works instantly!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                <span>Your Name</span>
              </label>
              <input
                id="input-gate-name"
                type="text"
                required
                placeholder="e.g. Robin Sharma"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:outline-none focus:ring-1 focus:ring-forest-500 transition-all font-medium"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>Email Address</span>
            </label>
            <input
              id="input-gate-email"
              type="email"
              required
              placeholder="you@domain.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:outline-none focus:ring-1 focus:ring-forest-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Password</span>
            </label>
            <input
              id="input-gate-password"
              type="password"
              required
              placeholder="••••••••"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-50 focus:outline-none focus:ring-1 focus:ring-forest-500 transition-all font-medium"
            />
          </div>

          <button
            id="btn-gate-submit"
            type="submit"
            disabled={authLoading}
            className="w-full sm:py-3 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/15 cursor-pointer disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-2 mt-6 uppercase tracking-wider select-none focus:outline-none"
          >
            {authLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <KeyRound className="h-3.5 w-3.5 text-white" />
                <span>{authMode === 'login' ? 'Sign In and Sync' : 'Register and Start Onboarding'}</span>
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="my-5 flex items-center justify-between">
          <div className="h-[1px] bg-stone-200/60 dark:bg-stone-800/80 flex-1"></div>
          <span className="text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider px-3 select-none">OR</span>
          <div className="h-[1px] bg-stone-200/60 dark:bg-stone-800/80 flex-1"></div>
        </div>

        {/* Google Authentication Button */}
        <button
          id="btn-gate-google-signin"
          type="button"
          disabled={authLoading}
          onClick={signInWithGoogle}
          className="w-full py-3 rounded-xl border border-stone-250 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 transition-all text-center flex items-center justify-center gap-2.5 select-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-850/60"
        >
          {authLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-stone-400" />
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Feature Highlights beneath */}
        <div className="mt-8 border-t border-stone-100 dark:border-stone-850/60 pt-4 grid grid-cols-2 gap-3 text-center">
          <div className="p-2 space-y-1">
            <Sparkles className="h-4 w-4 text-amber-500 mx-auto" />
            <h4 className="text-[10px] font-bold text-stone-800 dark:text-stone-200">Global Community</h4>
            <p className="text-[9px] text-stone-400">Share actions on live Firestore feeds</p>
          </div>
          <div className="p-2 space-y-1">
            <Smile className="h-4 w-4 text-emerald-500 mx-auto" />
            <h4 className="text-[10px] font-bold text-stone-800 dark:text-stone-200">Interactive Memes</h4>
            <p className="text-[9px] text-stone-400">Debunk climate ironies using Gemini AI</p>
          </div>
        </div>

      </div>

    </div>
  );
};
