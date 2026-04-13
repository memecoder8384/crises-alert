import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MapWrapper from '../components/MapWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useLocationStore } from '../features/map/LocationContext';

const StaffMapView = () => {
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const { mapCenter, userLocation, requestLocation } = useLocationStore();
  const [locating, setLocating] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      const inc = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidents(inc);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), where('active', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const al = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlerts(al);
    });
    return unsubscribe;
  }, []);

  const safeZones = [
    { id: 1, location: { lat: 40.7100, lng: -74.0010 }, radius: 500 }
  ];

  const handleGetLocation = () => {
    setLocating(true);
    requestLocation(
      () => setLocating(false),
      (err) => {
        console.error(err);
        alert(err.message || "Could not fetch location.");
        setLocating(false);
      }
    );
  };

  return (
    <DashboardLayout role="staff">
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        
        {alerts.length > 0 && (
          <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <div>
                <strong className="block text-sm font-bold uppercase tracking-wider">Active Command Alert</strong>
                <span className="text-base">{alerts[0].message}</span>
              </div>
            </div>
          </div>
        )}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Field Operations Map</h1>
            <p className="text-secondary mt-1">Cross-reference active incidents and command zones.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGetLocation} loading={locating}>
              <span className="material-symbols-outlined mr-2 text-[18px]">my_location</span>
              Sync Location
            </Button>
          </div>
        </header>

        <Card className="flex-1 relative overflow-hidden flex flex-col pt-4 pr-4 pl-4 pb-0" padding="">
           <div className="absolute top-4 left-6 z-10 bg-surface-container-lowest/80 backdrop-blur px-3 py-1.5 rounded border border-outline-variant/10 shadow-sm">
             <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
               Ground Telemetry Live
             </span>
           </div>
           <div className="flex-1 rounded-t-lg overflow-hidden border border-outline-variant/10 border-b-0 min-h-[500px]">
             <MapWrapper incidents={incidents} safeZones={safeZones} center={mapCenter} userLocation={userLocation} />
           </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffMapView;
