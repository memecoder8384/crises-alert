import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const StaffAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'staff_alerts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlerts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markResolved = async (id) => {
    try {
      await updateDoc(doc(db, 'staff_alerts', id), {
        status: 'resolved'
      });
    } catch(err) {
      console.error(err);
      alert('Failed to update ticket status.');
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full shrink-0">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Staff Incident Inbox</h1>
            <p className="text-secondary mt-1">Review mathematically escalated AI alerts from field managers.</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <div className="flex animate-pulse flex-col space-y-4">
              <div className="h-32 bg-surface-container-low rounded-lg w-full"></div>
              <div className="h-32 bg-surface-container-low rounded-lg w-full"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low/50 rounded-lg border-2 border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-[48px] text-emerald-500 opacity-50 mb-4 block">check_circle</span>
              <p className="text-secondary font-medium">All field constraints nominal.</p>
              <p className="text-xs text-outline mt-1">No escalated alerts in the queue.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <Card key={alert.id} className={`flex flex-col relative overflow-hidden transition-all duration-300 border ${alert.status === 'resolved' ? 'border-emerald-500/30 bg-emerald-500/5 opacity-70' : 'border-error/20 bg-surface-container-lowest shadow-md'}`}>
                {/* Visual Type Indicator Tag */}
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider text-white ${
                  alert.status === 'resolved' ? 'bg-emerald-500/80 text-white' :
                  alert.type === 'medical' ? 'bg-red-500' :
                  alert.type === 'rescue' ? 'bg-orange-500' :
                  alert.type === 'shelter' ? 'bg-purple-500' : 'bg-blue-500'
                }`}>
                  {alert.status === 'resolved' ? 'RESOLVED' : alert.type}
                </div>

                <div className="flex items-start gap-4 p-2 pb-0">
                  <div className={`mt-1 flex-shrink-0 p-2 rounded-full ${alert.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-error/10 text-error'}`}>
                    <span className="material-symbols-outlined">{alert.status === 'resolved' ? 'check_circle' : 'warning'}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-20">
                    <h3 className={`text-base font-bold ${alert.status === 'resolved' ? 'line-through text-outline' : 'text-on-surface'}`}>
                      {alert.issue}
                    </h3>
                    <p className="text-xs text-secondary mb-4 flex items-center gap-1.5 mt-1 font-mono">
                      <span className="material-symbols-outlined text-[14px]">terminal</span> 
                      Source: {alert.reportedBy} • {alert.timestamp?.toDate().toLocaleString()}
                    </p>

                    {/* AI Payload Box */}
                    <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs font-medium text-on-surface whitespace-pre-wrap leading-relaxed shadow-inner w-full custom-scrollbar">
                      <strong className="text-primary/80 block mb-1.5 uppercase tracking-widest text-[9px] sticky top-0 bg-surface-container-low pb-1 z-10">AI Tactical Analysis</strong>
                      <div dangerouslySetInnerHTML={{ __html: alert.aiReport?.replace(/(critical|immediately|danger|alert|warning|deficit|shortfall)/gi, '<span class="text-error font-bold border-b border-error/30 pb-0.5 animate-pulse bg-error/10 px-1 rounded-sm">$&</span>') }} />
                    </div>
                  </div>
                </div>

                {alert.status !== 'resolved' && (
                  <div className="mt-5 border-t border-outline-variant/10 flex justify-end">
                    <button onClick={() => markResolved(alert.id)} className="px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 flex items-center gap-2 rounded-br-lg md:rounded-bl-lg transition-colors ml-auto md:w-auto w-full justify-center border-l border-outline-variant/10">
                      <span className="material-symbols-outlined text-[16px]">done_all</span> Mark as Resolved
                    </button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffAlerts;
