import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth, api } from '../store/AuthContext';
import { User, Lock, Bell, Palette, Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface NotificationPrefs {
  ticketCreated: boolean;
  statusChanged: boolean;
  commented: boolean;
  assigned: boolean;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  notificationPreferences: NotificationPrefs;
}

const NOTIFICATION_LABELS: Record<keyof NotificationPrefs, string> = {
  ticketCreated: 'New ticket created',
  statusChanged: 'Ticket status changed',
  commented: 'New comment posted',
  assigned: 'Ticket assigned to me',
};

// Reusable save status indicator
const SaveStatus = ({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) => {
  if (status === 'idle') return null;
  return (
    <span className={`flex items-center gap-1.5 text-xs transition-opacity ${status === 'error' ? 'text-destructive' : status === 'saved' ? 'text-green-500' : 'text-muted-foreground'}`}>
      {status === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'saved' && <Check className="w-3 h-3" />}
      {status === 'error' && <AlertCircle className="w-3 h-3" />}
      {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved!' : 'Error'}
    </span>
  );
};

export const SettingsPage = () => {
  const { user: authUser } = useAuth();

  // ── Profile data from API ────────────────────────────────────────────────
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then(r => r.data),
  });

  // ── Notifications ────────────────────────────────────────────────────────
  const defaultPrefs: NotificationPrefs = {
    ticketCreated: true, statusChanged: true, commented: false, assigned: true,
  };
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [notifStatus, setNotifStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (profile?.notificationPreferences) {
      setPrefs(profile.notificationPreferences);
    }
  }, [profile]);

  const saveNotifMutation = useMutation({
    mutationFn: (data: NotificationPrefs) => api.patch('/users/notifications', data),
    onMutate: () => setNotifStatus('saving'),
    onSuccess: () => { setNotifStatus('saved'); setTimeout(() => setNotifStatus('idle'), 2500); },
    onError: () => { setNotifStatus('error'); setTimeout(() => setNotifStatus('idle'), 3000); },
  });

  const handleToggle = (key: keyof NotificationPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    saveNotifMutation.mutate(updated);
  };

  // ── Change Password ──────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/users/password', data),
    onMutate: () => { setPwError(''); setPwStatus('saving'); },
    onSuccess: () => {
      setPwStatus('saved');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwStatus('idle'), 2500);
    },
    onError: (err: any) => {
      setPwStatus('error');
      setPwError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setPwStatus('idle'), 3000);
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    changePasswordMutation.mutate({ currentPassword: currentPw, newPassword: newPw });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="space-y-6">

        {/* ── Profile ── */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Profile</h2>
          </div>
          <div className="p-5 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
              {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-base font-semibold">{authUser?.name}</p>
              <p className="text-sm text-muted-foreground">{authUser?.email}</p>
              <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary capitalize font-medium">
                {authUser?.role}
              </span>
            </div>
          </div>
        </section>

        {/* ── Change Password ── */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Change Password</h2>
            </div>
            <SaveStatus status={pwStatus} />
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
            {pwError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pwError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${confirmPw && newPw !== confirmPw ? 'border-destructive' : 'border-input'}`}
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending || !currentPw || !newPw || !confirmPw}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePasswordMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                  : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Notifications ── */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Notification Preferences</h2>
            </div>
            <SaveStatus status={notifStatus} />
          </div>
          <div className="p-5 space-y-4">
            {(Object.keys(prefs) as (keyof NotificationPrefs)[]).map(key => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{NOTIFICATION_LABELS[key]}</p>
                </div>
                <button
                  onClick={() => handleToggle(key)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${prefs[key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  role="switch"
                  aria-checked={prefs[key]}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Appearance ── */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Appearance</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle between light and dark theme</p>
              </div>
              <button
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="px-4 py-1.5 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
              >
                Toggle Theme
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;
