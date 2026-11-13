import React from 'react';
import { type User } from 'firebase/auth';
import { Globe, LogIn, LogOut, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { loginWithGoogle, logout, getAuthErrorMessage } from '../firebase';

interface NavbarProps {
  user: User | null;
  loadingAuth: boolean;
  onOpenCreateModal: () => void;
  siteCount: number;
  onAuthError?: (message: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  loadingAuth,
  onOpenCreateModal,
  siteCount,
  onAuthError
}) => {
  const [loggingIn, setLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    try {
      setLoggingIn(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      onAuthError?.(getAuthErrorMessage(error));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                HostDeploy
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                HTML Hosting
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation & Quick Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Pengasingan Akaun Google Peribadi
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-xs text-slate-400 font-mono">
            {user ? `${siteCount} Laman Dihoskan` : 'Akses Awam Pantas'}
          </span>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {loadingAuth ? (
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCreateModal}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Deploy HTML Baharu
              </button>

              {/* User profile dropdown info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Pengguna'}
                    className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left max-w-[140px] truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {user.displayName || 'Pengguna Google'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-mono">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log Keluar"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loggingIn}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              {loggingIn ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Log Masuk Guna Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
