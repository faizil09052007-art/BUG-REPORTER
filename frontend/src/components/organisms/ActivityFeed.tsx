import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, RefreshCw, Plus, UserPlus, Loader2 } from 'lucide-react';
import { api } from '../../store/AuthContext';

interface Activity {
  _id: string;
  action: 'CREATED' | 'STATUS_CHANGED' | 'COMMENTED' | 'ASSIGNED';
  entityId: string;
  user: { name: string; avatar: string };
  details: string;
  createdAt: string;
}

const ACTION_CONFIG = {
  CREATED:        { icon: Plus,         color: 'text-green-500',  label: 'created' },
  STATUS_CHANGED: { icon: RefreshCw,    color: 'text-blue-500',   label: 'updated status on' },
  COMMENTED:      { icon: MessageSquare,color: 'text-orange-500', label: 'commented on' },
  ASSIGNED:       { icon: UserPlus,     color: 'text-purple-500', label: 'assigned' },
};

const timeAgo = (dateStr: string) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
};

export const ActivityFeed = () => {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities').then(r => r.data),
    refetchInterval: 15000, // Poll every 15s
  });

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm w-full h-[300px] overflow-hidden flex flex-col">
      <h3 className="text-sm font-semibold mb-4">Activity Audit Log</h3>
      <div className="overflow-y-auto flex-1 pr-2 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">No activity yet. Create a ticket to get started!</p>
          </div>
        ) : activities.map(activity => {
          const cfg = ACTION_CONFIG[activity.action] || ACTION_CONFIG.CREATED;
          const Icon = cfg.icon;
          return (
            <div key={activity._id} className="flex gap-3 text-sm">
              <div className="mt-0.5 bg-muted rounded-full p-1.5 h-7 w-7 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-foreground">
                  <span className="font-medium">{activity.user?.name || 'Unknown'}</span>{' '}
                  <span className="text-muted-foreground">{cfg.label}</span>{' '}
                  <span className="font-medium text-primary">{activity.entityId}</span>
                </p>
                {activity.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(activity.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
