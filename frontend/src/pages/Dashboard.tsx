import React from 'react';
import { useAuth } from '../store/AuthContext';
import { KanbanBoard } from '../components/organisms/KanbanBoard';
import { AnalyticsWidget } from '../components/organisms/AnalyticsWidget';
import { ActivityFeed } from '../components/organisms/ActivityFeed';
import { CommandPalette } from '../components/organisms/CommandPalette';
import { NewTicketModal } from '../components/organisms/NewTicketModal';
import { LayoutDashboard, Bug, Users, Settings, LogOut, Bell, Search, Moon, Sun } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isCmdOpen, setIsCmdOpen] = React.useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCmdOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <Bug className="w-6 h-6 text-primary mr-2" />
          <span className="font-semibold text-lg tracking-tight">DefectSync</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          <a href="#" className="flex items-center px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium">
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Board
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md text-sm font-medium transition-colors">
            <Bug className="w-4 h-4 mr-3" />
            All Tickets
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md text-sm font-medium transition-colors">
            <Users className="w-4 h-4 mr-3" />
            Team
          </a>
        </nav>

        <div className="p-4 border-t">
          <a href="#" className="flex items-center px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md text-sm font-medium transition-colors mb-2">
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </a>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs mr-3">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">{user?.name || 'User'}</span>
                <span className="text-[10px] text-muted-foreground mt-1 capitalize">{user?.role || 'Developer'}</span>
              </div>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm z-10">
          <h1 className="font-semibold text-lg">Active Sprint Board</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search tickets... (⌘K)" 
                onClick={() => setIsCmdOpen(true)}
                readOnly
                className="pl-9 pr-4 py-1.5 text-sm bg-muted/50 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all cursor-pointer"
              />
            </div>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted" onClick={() => document.documentElement.classList.toggle('dark')}>
              <Moon className="w-5 h-5 hidden dark:block" />
              <Sun className="w-5 h-5 block dark:hidden" />
            </button>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <button 
              onClick={() => setIsNewTicketOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              New Ticket
            </button>
          </div>
        </header>

        {/* Board Area */}
        <div className="flex-1 overflow-auto bg-muted/10 p-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <AnalyticsWidget />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>
          <div className="h-[500px]">
            <KanbanBoard />
          </div>
        </div>
      </main>
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
      <NewTicketModal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} />
    </div>
  );
};

export default Dashboard;
