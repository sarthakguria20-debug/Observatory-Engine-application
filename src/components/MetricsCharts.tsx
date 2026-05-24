import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format } from 'date-fns';

interface MetricsChartsProps {
  data: any[];
}

export default function MetricsCharts({ data }: MetricsChartsProps) {
  
  const formatTime = (time: number) => format(new Date(time), 'HH:mm:ss');
  
  return (
    <div className="h-full flex flex-col gap-4 p-4 grow">
      <div className="flex-1 min-h-0 bg-[#0A0B0E] p-4 border border-[#1E293B] flex flex-col">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Log Volume Distribution (EPS)</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTime} 
                    stroke="#475569" 
                    fontSize={10} 
                    tickMargin={10} 
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0D0F14', border: '1px solid #1E293B', color: '#E2E8F0', borderRadius: '0px' }}
                   itemStyle={{ fontSize: 11, fontFamily: 'monospace' }}
                   labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                   labelFormatter={(t) => format(new Date(t), 'HH:mm:ss')}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10, fontFamily: 'sans-serif', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="INFO" stackId="1" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorInfo)" />
                <Area type="monotone" dataKey="WARN" stackId="1" stroke="#f59e0b" fillOpacity={1} fill="#f59e0b" />
                <Area type="monotone" dataKey="ERROR" stackId="1" stroke="#f43f5e" fillOpacity={1} fill="url(#colorError)" />
                <Area type="monotone" dataKey="CRITICAL" stackId="1" stroke="#fb7185" fillOpacity={1} fill="#fb7185" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

       <div className="flex-1 min-h-0 bg-[#0A0B0E] p-4 border border-[#1E293B] flex flex-col">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Error / Critical Spikes</h3>
          <div className="flex-1 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                 <XAxis 
                     dataKey="time" 
                     tickFormatter={formatTime} 
                     stroke="#475569" 
                     fontSize={10} 
                     tickMargin={10} 
                     axisLine={false}
                     tickLine={false}
                 />
                 <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#0D0F14', border: '1px solid #1E293B', color: '#E2E8F0', borderRadius: '0px' }}
                    itemStyle={{ fontSize: 11, fontFamily: 'monospace' }}
                    labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                    labelFormatter={(t) => format(new Date(t), 'HH:mm:ss')}
                    cursor={{fill: '#1E293B'}}
                 />
                 <Bar dataKey="ERROR" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                 <Bar dataKey="CRITICAL" stackId="a" fill="#fb7185" radius={[0, 0, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
}
