import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Play, Square, TerminalSquare, Database, Server, RefreshCcw } from 'lucide-react';
import { LogEntry, Alert, MetricsSnapshot } from '../types';
import { cn } from '../lib/utils';
import LogViewer from './LogViewer';
import AlertViewer from './AlertViewer';
import SimulatedAgentControl from './SimulatedAgentControl';
import MetricsCharts from './MetricsCharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'alerts'>('overview');
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0A0B0E] text-[#E2E8F0]">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#1E293B] bg-[#0D0F14] px-6 flex items-center justify-between sticky top-0 z-10 w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white">Λ</div>
          <div className="leading-none flex flex-col justify-center">
            <h1 className="text-sm font-bold tracking-tight uppercase">LUMEN_CORE</h1>
            <p className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">Observability Engine</p>
          </div>
        </div>
        
        <SimulatedAgentControl />
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col pt-6 px-6 max-w-7xl w-full mx-auto pb-4 gap-6 overflow-hidden">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="bg-[#11141D] border border-[#1E293B] p-4 flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5" /> Total Logs Ingested
            </span>
            <span className="text-2xl font-mono font-bold">{metrics?.totalLogs.toLocaleString() || 0}</span>
          </div>

          <div className="bg-[#11141D] border border-[#1E293B] p-4 flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
              <RefreshCcw className="w-3.5 h-3.5" /> Average EPS (Est)
            </span>
            <span className="text-2xl font-mono font-bold text-sky-400">
              {metrics ? Math.floor(metrics.totalLogs / 60) : 0}
            </span>
          </div>

          <div className="bg-[#11141D] border border-[#1E293B] p-4 flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
              <TerminalSquare className="w-3.5 h-3.5" /> Error Rate
            </span>
            <span className={cn(
              "text-2xl font-mono font-bold",
              (metrics?.currentErrorRate || 0) > 5 ? "text-rose-500" : "text-emerald-400"
            )}>
              {metrics?.currentErrorRate.toFixed(2) || "0.00"}%
            </span>
          </div>

           <div className="bg-[#11141D] border border-[#1E293B] p-4 flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Services Tracked
            </span>
            <span className="text-2xl font-mono font-bold">
              {metrics ? Object.keys(metrics.distributionByService).length : 0}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn("px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors border", activeTab === 'overview' ? "bg-sky-500/10 text-sky-400 border-sky-500/50" : "bg-[#11141D] border-[#1E293B] text-slate-500 hover:text-slate-300")}
          >
            Overview Charts
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn("px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors border", activeTab === 'logs' ? "bg-sky-500/10 text-sky-400 border-sky-500/50" : "bg-[#11141D] border-[#1E293B] text-slate-500 hover:text-slate-300")}
          >
            Live Logs
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={cn("px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors border", activeTab === 'alerts' ? "bg-sky-500/10 text-sky-400 border-sky-500/50" : "bg-[#11141D] border-[#1E293B] text-slate-500 hover:text-slate-300")}
          >
            Alerts
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="flex-1 min-h-0 bg-[#050505] border border-[#1E293B] overflow-hidden flex flex-col">
            <MetricsCharts data={metrics?.timeSeries || []} />
          </div>
        )}

        {activeTab === 'logs' && (
           <div className="flex-1 min-h-0 flex flex-col">
             <LogViewer />
           </div>
        )}

        {activeTab === 'alerts' && (
           <div className="flex-1 min-h-0 flex flex-col">
             <AlertViewer />
           </div>
        )}

      </main>
    </div>
  );
}
