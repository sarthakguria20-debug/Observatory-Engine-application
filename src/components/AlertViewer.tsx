import React, { useState, useEffect } from 'react';
import { Alert } from '../types';
import { cn } from '../lib/utils';
import { BellRing, CheckCircle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function AlertViewer() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const fetchAlerts = async () => {
             try {
                const res = await fetch('/api/alerts');
                if (res.ok) setAlerts(await res.json());
             } catch (e) {
                 console.error(e);
             }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleAck = async (id: string) => {
        try {
            await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
            // Optimistic update
            setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
        } catch (e) {
            console.error(e);
        }
    };

    const activeCount = alerts.filter(a => !a.acknowledged).length;

    return (
        <div className="bg-[#11141D] border border-[#1E293B] overflow-hidden flex flex-col flex-1 h-full">
            <div className="bg-[#0D0F14] border-b border-[#1E293B] p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <BellRing className="w-4 h-4 text-emerald-500" />
                   <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Alerts</h2>
                   {activeCount > 0 && (
                       <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/30 ml-2">
                         {activeCount} Active
                       </span>
                   )}
                </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-sans text-xs uppercase tracking-wider">
                       No alerts triggered yet. System is healthy.
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div 
                           key={alert.id}
                           className={cn(
                               "border p-3 transition-all",
                               alert.acknowledged 
                                 ? "border-[#1E293B] bg-[#0A0B0E] opacity-60" 
                                 : alert.severity === 'CRITICAL' 
                                   ? "border-rose-500/50 bg-rose-900/10" 
                                   : "border-amber-500/50 bg-amber-500/10"
                           )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className={cn("w-4 h-4", alert.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500')} />
                                    <h3 className={cn("text-xs font-bold uppercase tracking-wider", alert.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400')}>
                                        {alert.ruleMatched}
                                    </h3>
                                    <span className="text-[10px] opacity-60 font-mono">
                                       {format(new Date(alert.timestamp), 'MMM dd HH:mm:ss')}
                                    </span>
                                </div>
                                {!alert.acknowledged && (
                                    <button 
                                      onClick={() => handleAck(alert.id)}
                                      className="text-[10px] flex items-center gap-1.5 px-2 py-1 bg-[#11141D] hover:bg-[#1E293B] text-slate-300 transition-colors border border-[#1E293B] uppercase tracking-wider font-bold"
                                    >
                                       <CheckCircle className="w-3 h-3 text-emerald-500" /> Acknowledge
                                    </button>
                                )}
                            </div>
                            
                            <div className="bg-[#050505] border border-[#1E293B] p-2 text-[11px] font-mono text-slate-300 mt-2 break-all leading-tight">
                                <div className="mb-1">
                                   <span className="text-emerald-500 mr-2">{"{"}"service": "{alert.logContext.service}"{"}"}</span>
                                </div>
                                {alert.logContext.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
