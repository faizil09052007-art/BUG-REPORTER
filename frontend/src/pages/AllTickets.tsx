import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bug, ExternalLink, Filter, Search, ChevronDown } from 'lucide-react';
import { api } from '../store/AuthContext';

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  reporter: { name: string };
  createdAt: string;
  tags: string[];
}

const STATUS_STYLES: Record<string, string> = {
  'New': 'bg-blue-500/10 text-blue-400',
  'In-Progress': 'bg-yellow-500/10 text-yellow-400',
  'Resolved': 'bg-green-500/10 text-green-400',
  'Closed': 'bg-muted text-muted-foreground',
};
const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400',
  High: 'bg-orange-500/10 text-orange-400',
  Medium: 'bg-blue-500/10 text-blue-400',
  Low: 'bg-muted text-muted-foreground',
};

export const AllTicketsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['tickets'],
    queryFn: () => api.get('/tickets').then(r => r.data),
  });

  const filtered = tickets.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{tickets.length} total tickets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="In-Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[auto_1fr_120px_100px_140px_80px] gap-4 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>ID</span>
          <span>Title</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Reporter</span>
          <span>Date</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bug className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No tickets found</p>
          </div>
        ) : (
          filtered.map(ticket => (
            <button
              key={ticket._id}
              onClick={() => navigate(`/ticket/${ticket._id}`)}
              className="w-full grid grid-cols-[auto_1fr_120px_100px_140px_80px] gap-4 px-4 py-3.5 border-b last:border-0 hover:bg-muted/30 transition-colors text-left group items-center"
            >
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                {ticket.ticketNumber}
              </span>
              <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {ticket.title}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium w-fit ${STATUS_STYLES[ticket.status] || ''}`}>
                {ticket.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium w-fit ${PRIORITY_STYLES[ticket.priority] || ''}`}>
                {ticket.priority}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {ticket.reporter?.name || '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default AllTicketsPage;
