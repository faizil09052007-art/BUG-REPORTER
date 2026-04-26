import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageSquare, Paperclip, Activity, Tag, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../store/AuthContext';

export const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'comments' | 'attachments' | 'history'>('description');

  // Mock data fetching
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const res = await api.get(`/tickets/${id}`);
      return res.data;
    }
  });

  if (isLoading || !ticket) {
    return <div className="p-8 text-muted-foreground flex items-center justify-center h-screen"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div> Loading Ticket Details...</div>;
  }

  const priorityColors: Record<string, string> = {
    Low: 'bg-green-500/10 text-green-500',
    Medium: 'bg-blue-500/10 text-blue-500',
    High: 'bg-orange-500/10 text-orange-500',
    Critical: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="flex h-screen bg-background text-foreground flex-col">
      <header className="h-14 border-b flex items-center px-6 bg-card">
        <button onClick={() => navigate(-1)} className="mr-4 p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">{ticket.ticketNumber}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${priorityColors[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-muted text-muted-foreground">
            {ticket.status}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
            
            {/* Tabs */}
            <div className="flex border-b border-border gap-6">
              {[
                { id: 'description', label: 'Description', icon: <Clock className="w-4 h-4 mr-2" /> },
                { id: 'comments', label: `Comments (${(ticket.comments || []).length})`, icon: <MessageSquare className="w-4 h-4 mr-2" /> },
                { id: 'attachments', label: `Attachments (${(ticket.attachments || []).length})`, icon: <Paperclip className="w-4 h-4 mr-2" /> },
                { id: 'history', label: 'History', icon: <Activity className="w-4 h-4 mr-2" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="pt-2">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              )}
              
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {(ticket.comments || []).map((comment: any) => (
                    <div key={comment._id || comment.id} className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{(comment.user || 'U').charAt(0)}</div>
                          <span className="text-sm font-medium">{comment.user}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 pl-8">{comment.text}</p>
                    </div>
                  ))}
                  <div className="mt-4">
                    <textarea 
                      className="w-full h-24 bg-background border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground"
                      placeholder="Add a comment..."
                    />
                    <div className="flex justify-end mt-2">
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="w-full md:w-72 space-y-6">
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">People</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assignee</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{ticket.assignedAgentId ? 'Assigned' : 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reporter</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{ticket.reporter.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time Logged</span>
                    <span className="text-sm font-medium">4h 30m</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(ticket.tags || []).length > 0 ? (ticket.tags || []).map((tag: string) => (
                    <span key={tag} className="flex items-center bg-muted text-muted-foreground text-xs px-2 py-1 rounded-md">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  )) : (
                    <span className="text-xs text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default TicketDetail;
