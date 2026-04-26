import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { TicketCard } from './TicketCard';
import { Ticket } from './KanbanBoard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tickets: Ticket[];
  key?: React.Key | string | number;
}

export const KanbanColumn = ({ id, title, tickets }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-muted/30 rounded-xl p-3 border">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
          {tickets.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[150px]">
        <SortableContext 
          id={id}
          items={tickets.map(t => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map(ticket => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
