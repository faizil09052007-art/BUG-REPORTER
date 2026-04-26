import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { api } from '../../store/AuthContext';

export const AnalyticsWidget = () => {
  const { data = [], isLoading } = useQuery<{ name: string; new: number; resolved: number }[]>({
    queryKey: ['analytics', 'tickets'],
    queryFn: () => api.get('/analytics/tickets').then(r => r.data),
    refetchInterval: 30000,
  });

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm w-full h-[300px]">
      <h3 className="text-sm font-semibold mb-4">Defect Resolution Trend (Last 7 Days)</h3>
      {isLoading ? (
        <div className="flex items-center justify-center h-[220px]">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              name="Resolved"
            />
            <Area
              type="monotone"
              dataKey="new"
              stackId="2"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.2}
              name="New"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
