import React from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KanbanColumn } from './KanbanColumn';
import { api } from '../../store/AuthContext';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: 'New' | 'In-Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

const COLUMNS = ['New', 'In-Progress', 'Resolved', 'Closed'];

export const KanbanBoard = () => {
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await api.get('/tickets');
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string, status: string }) => {
      await api.patch(`/tickets/${ticketId}/status`, { status });
      return { ticketId, status };
    },
    onMutate: async ({ ticketId, status }: { ticketId: string, status: string }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previousTickets = queryClient.getQueryData<Ticket[]>(['tickets']);
      
      // Optimistically update to the new value
      queryClient.setQueryData<Ticket[]>(['tickets'], (old: Ticket[] | undefined) => 
        old?.map((t: Ticket) => t._id === ticketId ? { ...t, status: status as Ticket['status'] } : t)
      );
      
      return { previousTickets };
    },
    onError: (_err: Error, _newTodo: any, context: any) => {
      queryClient.setQueryData(['tickets'], context?.previousTickets);
    },
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const ticketId = active.id as string;
    const overId = over.id as string;

    const activeTicket = tickets.find((t: Ticket) => t._id === ticketId);
    const overColumn = COLUMNS.includes(overId) ? overId : tickets.find((t: Ticket) => t._id === overId)?.status;

    if (!activeTicket || !overColumn || activeTicket.status === overColumn) {
      return;
    }

    updateStatusMutation.mutate({ ticketId, status: overColumn });
  };

  if (isLoading) {
    return <div className="p-8 text-muted-foreground flex items-center gap-3"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> Loading Board...</div>;
  }

  return (
    <div className="flex h-full gap-6 p-4 overflow-x-auto items-start">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((column) => (
          <KanbanColumn 
            key={column} 
            id={column} 
            title={column} 
            tickets={tickets.filter((t: Ticket) => t.status === column)} 
          />
        ))}
      </DndContext>
    </div>
  );
};
