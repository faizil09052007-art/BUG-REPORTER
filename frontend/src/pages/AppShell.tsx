import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, api } from '../store/AuthContext';
import { CommandPalette } from '../components/organisms/CommandPalette';
import { NewTicketModal } from '../components/organisms/NewTicketModal';
import {
  LayoutDashboard, Bug, Users, Settings, LogOut,
  Bell, Search, Moon, Sun, Plus, RefreshCw, MessageSquare,
  UserPlus, Check, X
} from 'lucide-react';

interface Activity {
  _id: string;
  action: 'CREATED' | 'STATUS_CHANGED' | 'COMMENTED' | 'ASSIGNED';
  entityId: string;
  user: { name: string };
  details: string;
  createdAt: string;
}

const ACTION_ICON: Record<string, React.ReactNode> = {
  CREATED:        <Plus className="w-3.5 h-3.5 text-green-500" />,
  STATUS_CHANGED: <RefreshCw className="w-3.5 h-3.5 text-blue-400" />,
  COMMENTED:      <MessageSquare className="w-3.5 h-3.5 text-orange-400" />,
  ASSIGNED:       <UserPlus className="w-3.5 h-3.5 text-purple-400" />,
};
const ACTION_LABEL: Record<string, string> = {
  CREATED: 'created',
  STATUS_CHANGED: 'updated status on',
  COMMENTED: 'commented on',
  ASSIGNED: 'assigned',
};

const timeAgo = (d: string) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;

export const AppShell = () => {
  const { user, logout } = useAuth();
  const [isCmdOpen, setIsCmdOpen] = React.useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [readIds, setReadIds] = React.useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('readNotifIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Persist readIds to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('readNotifIds', JSON.stringify([...readIds]));
  }, [readIds]);

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities').then(r => r.data),
    refetchInterval: 15000,
  });

  // Close notification panel when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isNotifOpen]);

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCmdOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const unreadCount = activities.filter(a => !readIds.has(a._id)).length;

  const markAllRead = () => {
    setReadIds(new Set(activities.map(a => a._id)));
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b">
          <Bug className="w-6 h-6 text-primary mr-2" />
          <span className="font-semibold text-lg tracking-tight">DefectSync</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Board
          </NavLink>
          <NavLink to="/tickets" className={navLinkClass}>
            <Bug className="w-4 h-4 mr-3" />
            All Tickets
          </NavLink>
          <NavLink to="/team" className={navLinkClass}>
            <Users className="w-4 h-4 mr-3" />
            Team
          </NavLink>
        </nav>

        <div className="p-4 border-t">
          <NavLink to="/settings" className={navLinkClass}>
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </NavLink>
          <div className="flex items-center justify-between px-3 py-2 mt-2">
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium leading-none truncate">{user?.name || 'User'}</span>
                <span className="text-[10px] text-muted-foreground mt-1 capitalize">{user?.role || 'Developer'}</span>
              </div>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm z-20 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets... (⌘K)"
              onClick={() => setIsCmdOpen(true)}
              readOnly
              className="pl-9 pr-4 py-1.5 text-sm bg-muted/50 border rounded-full focus:outline-none w-64 cursor-pointer hover:bg-muted transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              title="Toggle theme"
            >
              <Moon className="w-5 h-5 hidden dark:block" />
              <Sun className="w-5 h-5 block dark:hidden" />
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(v => !v)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 top-12 w-96 bg-card border rounded-xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-white font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setIsNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
                    {activities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Bell className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm">No notifications yet</p>
                        <p className="text-xs mt-1">Create a ticket to get started</p>
                      </div>
                    ) : (
                      activities.slice(0, 20).map(activity => {
                        const isUnread = !readIds.has(activity._id);
                        return (
                          <div
                            key={activity._id}
                            onClick={() => setReadIds(prev => new Set([...prev, activity._id]))}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${isUnread ? 'bg-primary/5' : ''}`}
                          >
                            <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isUnread ? 'bg-primary/15' : 'bg-muted'}`}>
                              {ACTION_ICON[activity.action] || ACTION_ICON.CREATED}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-snug">
                                <span className="font-medium">{activity.user?.name || 'Unknown'}</span>
                                {' '}
                                <span className="text-muted-foreground">{ACTION_LABEL[activity.action] || activity.action.toLowerCase()}</span>
                                {' '}
                                <span className="font-medium text-primary">{activity.entityId}</span>
                              </p>
                              {activity.details && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.details}</p>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(activity.createdAt)}</p>
                            </div>
                            {isUnread && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {activities.length > 0 && (
                    <div className="border-t px-4 py-2.5 text-center">
                      <button
                        onClick={() => { setIsNotifOpen(false); }}
                        className="text-xs text-primary hover:underline"
                      >
                        View all in Activity Feed →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* New Ticket */}
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>

      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
      <NewTicketModal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} />
    </div>
  );
};

export default AppShell;
