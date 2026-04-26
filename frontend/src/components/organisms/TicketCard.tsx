import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Ticket } from './KanbanBoard';
import { AlertCircle, Clock, CheckCircle, HelpCircle } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  key?: React.Key | string | number;
}

const priorityColors = {
  Low: 'bg-green-500/10 text-green-500 border-green-500/20',
  Medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  High: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusIcons = {
  'New': <HelpCircle className="w-4 h-4 text-muted-foreground" />,
  'In-Progress': <Clock className="w-4 h-4 text-blue-500" />,
  'Resolved': <CheckCircle className="w-4 h-4 text-green-500" />,
  'Closed': <AlertCircle className="w-4 h-4 text-muted-foreground" />
};

export const TicketCard = ({ ticket }: TicketCardProps) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ticket._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-[100px] bg-primary/5 border-2 border-primary/20 rounded-lg border-dashed"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card text-card-foreground border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md transition-all group relative"
    >
      <div 
        className="absolute inset-0 z-0" 
        onClick={() => {
          if (!isDragging) {
            navigate(`/ticket/${ticket._id}`);
          }
        }} 
      />
      <div className="relative z-10 pointer-events-none">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-muted-foreground">{ticket.ticketNumber}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${priorityColors[ticket.priority]}`}>
            {ticket.priority}
          </span>
        </div>
        <p className="text-sm font-medium leading-snug mb-4 group-hover:text-primary transition-colors">
          {ticket.title}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <div className="flex -space-x-2">
            {/* Mock Assignee Avatar */}
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              A
            </div>
          </div>
          <div title={ticket.status}>
            {statusIcons[ticket.status]}
          </div>
        </div>
      </div>
    </div>
  );
};
