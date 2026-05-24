import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, StopCircle, Bot, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { randomUUID } from 'crypto'; // Crypto might not be available in browser easily for Vite unless polyfilled, let's use a simpler random string generator in the component instead

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

const SERVICES = ['api-gateway', 'auth-service', 'inventory-db', 'payment-processor', 'frontend-web'];
const INFO_TEMPLATES = [
    "Processed request for route /api/v1/users successfully",
    "Cache hit for key user_profile_metadata",
    "Heartbeat syn ack received from cluster node 04",
    "Session validated for connected client",
    "Connection established to upstream proxy"
];
const WARN_TEMPLATES = [
    "Response time degraded for database query (>500ms)",
    "Rate limit threshold approaching for IP 192.168.1.55",
    "Deprecation notice: utilizing legacy V1 payload structure",
    "Minor packet loss detected in secondary region"
];
const ERROR_TEMPLATES = [
    "Database connection timeout during transaction commit",
    "Failed to bind port 8080 - address in use",
    "Null pointer exception in payload parser module",
    "Upstream service payment-processor returned 502 Bad Gateway"
];
const CRITICAL_TEMPLATES = [
    "CRITICAL_ERROR: Split-brain detected in Elasticsearch cluster!",
    "CRITICAL_ERROR: Unauthorized access attempt blocking mechanism failed!",
    "CRITICAL_ERROR: OOM killer triggered - service out of memory!"
];

export default function SimulatedAgentControl() {
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const emitLogs = async () => {
        // Generate a random burst of 1 to 5 logs
        const burstSize = Math.floor(Math.random() * 5) + 1;
        const logs = [];

        for (let i = 0; i < burstSize; i++) {
            const r = Math.random();
            let level = 'INFO';
            let message = '';
            
            if (r > 0.98) { level = 'CRITICAL'; message = CRITICAL_TEMPLATES[Math.floor(Math.random() * CRITICAL_TEMPLATES.length)]; }
            else if (r > 0.90) { level = 'ERROR'; message = ERROR_TEMPLATES[Math.floor(Math.random() * ERROR_TEMPLATES.length)]; }
            else if (r > 0.8) { level = 'WARN'; message = WARN_TEMPLATES[Math.floor(Math.random() * WARN_TEMPLATES.length)]; }
            else { level = 'INFO'; message = INFO_TEMPLATES[Math.floor(Math.random() * INFO_TEMPLATES.length)]; }

            logs.push({
                id: generateId(),
                timestamp: new Date().toISOString(),
                level,
                service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
                message
            });
        }

        try {
            await fetch('/api/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logs)
            });
        } catch (e) {
            console.error("Agent failed to send logs", e);
        }
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(emitLogs, 800); // Emit every ~800ms
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    return (
        <div className="flex items-center gap-3 bg-[#11141D] p-1.5 border border-[#1E293B]">
            <div className="flex items-center gap-2 px-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-r border-[#1E293B] pr-4">
               <Bot className="w-3.5 h-3.5 text-sky-400" />
               Log Agent Sim
            </div>
            
            <button
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border",
                    isRunning 
                        ? "bg-[#0A0B0E] text-slate-400 border-[#1E293B] hover:bg-[#11141D]"
                        : "bg-emerald-900/30 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50"
                )}
            >
                {isRunning ? (
                    <>
                       <StopCircle className="w-3.5 h-3.5 text-rose-500" /> 
                       Stop Agent
                    </>
                ) : (
                    <>
                        <PlayCircle className="w-3.5 h-3.5" /> 
                        Start Agent
                    </>
                )}
            </button>
            <div className="w-8 flex justify-center">
                {isRunning && <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />}
            </div>
        </div>
    );
}
