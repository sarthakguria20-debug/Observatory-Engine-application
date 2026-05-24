import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// --- DATA STORE ---
// In a real application, this would be ClickHouse, Elasticsearch, Kafka, etc.
// For this contained full-stack demo, we'll use in-memory bounded arrays to simulate out fast-ingestion data stores.
import { randomUUID } from 'crypto';

interface LogEntry { id: string; timestamp: string; level: string; service: string; message: string; }
interface Alert { id: string; timestamp: string; ruleMatched: string; severity: string; logContext: LogEntry; acknowledged: boolean; }

const MAX_LOGS = 10000;
let logs: LogEntry[] = [];
let alerts: Alert[] = [];

function checkAlerts(log: LogEntry) {
  // Alerting logic simulating a stream processing engine like Flink or simple rules
  if (log.level === 'CRITICAL' || log.message.includes('CRITICAL_ERROR')) {
    alerts.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ruleMatched: 'Critical Error Logged',
      severity: 'CRITICAL',
      logContext: log,
      acknowledged: false,
    });
  } else if (log.level === 'ERROR') {
    // Simple rate limiting: only 1 error alert per service per a few seconds, or just log them all for demo.
    alerts.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ruleMatched: 'Standard Error Logged',
      severity: 'HIGH',
      logContext: log,
      acknowledged: false,
    });
  }
  
  // Bound alerts array
  if (alerts.length > 1000) {
    alerts = alerts.slice(-1000);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Ingestion Endpoint
  app.post('/api/ingest', (req, res) => {
    const payload = req.body;
    const incomingLogs = Array.isArray(payload) ? payload : [payload];
    
    const processedLogs = incomingLogs.map(log => {
      const entry: LogEntry = {
        id: log.id || randomUUID(),
        timestamp: log.timestamp || new Date().toISOString(),
        level: log.level || 'INFO',
        service: log.service || 'unknown',
        message: log.message || '',
      };
      checkAlerts(entry);
      return entry;
    });

    logs.push(...processedLogs);

    // Keep memory in check
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(logs.length - MAX_LOGS);
    }

    res.status(202).json({ ingested: processedLogs.length });
  });

  // Query Endpoint
  app.get('/api/logs', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const level = req.query.level as string;
    
    let result = logs;
    if (level && level !== 'ALL') {
      result = result.filter(l => l.level === level);
    }
    
    // Return latest logs first
    res.json(result.slice(-limit).reverse());
  });

  // Alerts Endpoint
  app.get('/api/alerts', (req, res) => {
    res.json(alerts.slice().reverse().slice(0, 50));
  });

  app.post('/api/alerts/:id/acknowledge', (req, res) => {
    const alert = alerts.find(a => a.id === req.params.id);
    if (alert) {
      alert.acknowledged = true;
    }
    res.json({ success: true });
  });

  // Aggregation/Metrics Endpoint (Simulating an OLAP query over ClickHouse)
  app.get('/api/metrics', (req, res) => {
    const now = Date.now();
    const metricsResult = {
      totalLogs: logs.length,
      currentErrorRate: 0,
      distributionByService: {} as Record<string, number>,
      distributionByLevel: {} as Record<string, number>,
      timeSeries: [] as any[] // For charts
    };

    // calculate over the whole memory buffer for simplicity
    let errorCount = 0;
    logs.forEach(log => {
      metricsResult.distributionByService[log.service] = (metricsResult.distributionByService[log.service] || 0) + 1;
      metricsResult.distributionByLevel[log.level] = (metricsResult.distributionByLevel[log.level] || 0) + 1;
      if (log.level === 'ERROR' || log.level === 'CRITICAL') {
        errorCount++;
      }
    });

    metricsResult.currentErrorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0;

    // Build a simple 60-bucket timeseries for the last minute if we have enough logs, otherwise just fake it or build a real one
    // For this simple demo, we will generate a live timeseries block on the frontend or we can bin them here.
    const buckets = 30; // 30 buckets
    const bucketInterval = 2000; // 2 seconds per bucket
    const timeSeriesMap = new Map();
    
    for (let i = 0; i < buckets; i++) {
        const t = now - (i * bucketInterval);
        timeSeriesMap.set(t - (t % bucketInterval), { time: t - (t % bucketInterval), INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 });
    }

    // Limit to the last minute of logs
    const lastMinuteLogs = logs.filter(l => (now - new Date(l.timestamp).getTime()) < (buckets * bucketInterval));

    lastMinuteLogs.forEach(log => {
      const logTime = new Date(log.timestamp).getTime();
      const bucketTime = logTime - (logTime % bucketInterval);
      if (timeSeriesMap.has(bucketTime)) {
          const bucket = timeSeriesMap.get(bucketTime);
          bucket[log.level] = (bucket[log.level] || 0) + 1;
      }
    });

    metricsResult.timeSeries = Array.from(timeSeriesMap.values()).sort((a, b) => a.time - b.time);

    res.json(metricsResult);
  });

  // --- VITE DEV / PRODUCTION MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Log Engine Server running on http://localhost:${PORT}`);
  });
}

startServer();
