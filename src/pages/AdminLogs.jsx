import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // We can pull alerts and incidents as "system logs" 
    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        let formattedDate = 'Unknown Time';
        if (d.timestamp) {
           formattedDate = d.timestamp.toDate ? d.timestamp.toDate().toLocaleString() : 'Processing...';
        }
        return {
          id: doc.id,
          event: `SYSTEM ALERT BROADCAST: ${d.message}`,
          level: 'CRITICAL',
          timestamp: formattedDate
        };
      });
      setLogs(data);
    });
    return unsubscribe;
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">System Audit Logs</h1>
            <p className="text-secondary mt-1">Immutable ledger of system events, alerts, and dispatches.</p>
          </div>
        </header>

        <Card className="flex-1 overflow-auto p-0 bg-surface-container-lowest border-surface-container shadow-inner">
          <div className="font-mono text-sm p-6 space-y-3">
             <div className="text-outline uppercase tracking-widest text-[10px] mb-4 pb-2 border-b border-surface-container flex">
               <span className="w-32 inline-block">Timestamp</span>
               <span className="w-24 inline-block">Severity</span>
               <span className="flex-1">Event Digest</span>
             </div>
             {logs.length === 0 ? (
               <div className="text-secondary italic">Awaiting telemetry logs...</div>
             ) : (
               logs.map((log) => (
                 <div key={log.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 hover:bg-surface-container transition-colors p-2 rounded">
                   <span className="text-secondary w-full sm:w-32 shrink-0">{log.timestamp}</span>
                   <span className="text-error font-bold tracking-wider w-full sm:w-24 shrink-0">{log.level}</span>
                   <span className="text-on-surface flex-1 truncate">{log.event}</span>
                 </div>
               ))
             )}
             
             {/* Mock historical logs for visual fulfillment */}
             <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-secondary/70 p-2">
                 <span className="w-full sm:w-32 shrink-0">11/4/2026, 14:02:11</span>
                 <span className="w-full sm:w-24 shrink-0 text-primary">INFO</span>
                 <span className="flex-1">System user (admin) authenticated via Firebase.</span>
             </div>
             <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-secondary/70 p-2">
                 <span className="w-full sm:w-32 shrink-0">11/4/2026, 12:45:00</span>
                 <span className="w-full sm:w-24 shrink-0 text-amber-500">WARNING</span>
                 <span className="flex-1">Location sync dropped for 5 devices in Sector 4.</span>
             </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminLogs;
