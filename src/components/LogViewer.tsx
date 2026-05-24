import React, { useState, useEffect } from 'react';
import { LogEntry } from '../types';
import { cn } from '../lib/utils';
import { Terminal, Filter, Settings2, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/logs?limit=300&level=${filterLevel}`);
        if (res.ok) {
           const data = await res.json();
           setLogs(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (isLive) {
       interval = setInterval(fetchLogs, 1500);
       fetchLogs(); // initial
    } else {
        fetchLogs(); // Fetch once if toggling to paused immediately (unlikely but good practice)
    }

    return () => clearInterval(interval);
  }, [filterLevel, isLive]);

  const levelColors: Record<string, string> = {
    INFO: 'text-emerald-400',
    WARN: 'text-amber-400',
    ERROR: 'text-rose-400 bg-rose-900/10 font-bold',
    CRITICAL: 'text-rose-200 bg-rose-900/20 font-bold tracking-tight',
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] border border-[#1E293B] overflow-hidden font-mono text-[11px] leading-relaxed flex-1">
      
      {/* Log Header Controls */}
      <div className="bg-[#0D0F14] border-b border-[#1E293B] p-2 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 font-sans font-bold text-xs uppercase tracking-wider">Live Tail (Last 300)</span>
          
          <button 
             onClick={() => setIsLive(!isLive)}
             className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] uppercase font-bold transition-colors", isLive ? "bg-sky-500/10 text-sky-400 border-sky-500/50" : "bg-[#11141D] text-slate-400 border-[#1E293B]")}
          >
             {isLive ? <Pause className="w-3" /> : <Play className="w-3" />}
             {isLive ? 'Live' : 'Paused'}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-slate-500" />
            <select 
               className="bg-[#11141D] border border-[#1E293B] text-slate-300 rounded-sm text-[10px] uppercase font-bold px-1 py-0.5 outline-none font-sans"
               value={filterLevel}
               onChange={e => setFilterLevel(e.target.value)}
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO Only</option>
              <option value="WARN">WARN Only</option>
              <option value="ERROR">ERROR / CRIT Only</option>
            </select>
        </div>
      </div>

      {/* Log Stream Area */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse">
        {logs.map((log) => (
          <div key={log.id} className={cn("grid grid-cols-12 gap-4 p-2 border-b border-slate-900 hover:bg-slate-900/50 transition-colors group", log.level === 'ERROR' || log.level === 'CRITICAL' ? levelColors[log.level] : '')}>
            <div className="col-span-2 text-slate-400 opacity-70">
              {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
            </div>
            <div className={cn("col-span-1 font-bold", levelColors[log.level] && log.level !== 'ERROR' && log.level !== 'CRITICAL' ? levelColors[log.level] : '')}>
              {log.level.substring(0, 4)}
            </div>
            <div className="col-span-2 text-sky-400 italic truncate hidden md:block">
              {log.service}
            </div>
            <div className="col-span-7 break-all">
              {log.message}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
           <div className="text-slate-500 text-center py-20 font-sans text-xs uppercase tracking-wider w-full">
             Waiting for incoming log stream...
           </div>
        )}
      </div>
      <div className="p-1 border-t border-[#1E293B] bg-[#0D0F14] text-center text-slate-500 text-[9px] uppercase tracking-wider shrink-0">
        Showing last 300 events — Tailing active...
      </div>
    </div>
  );
}
