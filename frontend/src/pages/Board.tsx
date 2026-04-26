import React from 'react';
import { KanbanBoard } from '../components/organisms/KanbanBoard';
import { AnalyticsWidget } from '../components/organisms/AnalyticsWidget';
import { ActivityFeed } from '../components/organisms/ActivityFeed';

export const BoardPage = () => {
  return (
    <div className="flex flex-col h-full p-4 overflow-auto">
      {/* Analytics row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6 shrink-0">
        <div className="xl:col-span-2">
          <AnalyticsWidget />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
      {/* Kanban Board */}
      <div className="flex-1 min-h-[500px]">
        <KanbanBoard />
      </div>
    </div>
  );
};

export default BoardPage;
