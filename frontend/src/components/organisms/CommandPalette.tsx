import React, { useState, useEffect } from 'react';
import { Search, FileText, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../store/AuthContext';

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'text-red-500',
  High:     'text-orange-500',
  Medium:   'text-yellow-500',
  Low:      'text-blue-400',
};

export const CommandPalette = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ['tickets'],
    queryFn: () => api.get('/tickets').then(r => r.data),
    enabled: isOpen,
    staleTime: 60_000,
  });

  // Filter tickets client-side for instant results
  const filtered = query.trim().length === 0
    ? tickets.slice(0, 8)
    : tickets.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.ticketNumber?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  // Reset search on close
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const goToTicket = (id: string) => {
    navigate(`/ticket/${id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-card border rounded-xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center px-4 border-b">
            <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
            <input
              autoFocus
              className="flex-1 h-14 bg-transparent border-0 outline-none placeholder:text-muted-foreground text-foreground text-sm"
              placeholder="Search tickets by title or ID..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <span className="text-xs text-muted-foreground border px-1.5 py-0.5 rounded bg-muted">ESC</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {/* Tickets */}
            {filtered.length > 0 && (
              <>
                <div className="text-xs font-medium text-muted-foreground px-2 py-2 mb-1">
                  Tickets {query && `— "${query}"`}
                </div>
                {filtered.map(ticket => (
                  <button
                    key={ticket._id}
                    className="w-full flex items-center px-3 py-2 rounded-md hover:bg-muted text-sm group transition-colors"
                    onClick={() => goToTicket(ticket._id)}
                  >
                    <FileText className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary shrink-0" />
                    <span className="text-muted-foreground mr-2 font-mono text-xs">{ticket.ticketNumber}</span>
                    <span className="flex-1 text-left truncate">{ticket.title}</span>
                    <span className={`text-xs ml-2 shrink-0 ${PRIORITY_COLOR[ticket.priority] || ''}`}>
                      {ticket.priority}
                    </span>
                  </button>
                ))}
              </>
            )}

            {query && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No tickets found for "{query}"</p>
            )}

            {/* Quick Actions */}
            <div className="text-xs font-medium text-muted-foreground px-2 py-2 mt-3 mb-1">Quick Actions</div>
            <button
              className="w-full flex items-center px-3 py-2 rounded-md hover:bg-muted text-sm group transition-colors"
              onClick={() => { navigate('/'); onClose(); }}
            >
              <Settings className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="flex-1 text-left">Go to Dashboard</span>
            </button>
          </div>

          <div className="border-t px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span><kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">↵</kbd> select</span>
            <span><kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
