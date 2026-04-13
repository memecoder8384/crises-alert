import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MapWrapper from '../components/MapWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useLocationStore } from '../features/map/LocationContext';

const CitizenDashboard = () => {
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
      
      // Trigger alarm tone for new alerts
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          playEmergencyBeep();
        }
      });
    });
    return unsubscribe;
  }, []);

  const playEmergencyBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // Drop pitch
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio autoplay policy blocked emergency beep:", e);
    }
  };

  const safeZones = [
    { id: 1, name: "Central High School", location: { lat: 40.7100, lng: -74.0010 }, radius: 500, maxCapacity: 1000, currentOccupancy: 850, status: "Open" },
    { id: 2, name: "Community Center Alpha", location: { lat: 40.7150, lng: -74.0100 }, radius: 300, maxCapacity: 500, currentOccupancy: 500, status: "Full" },
    { id: 3, name: "Westside Armory", location: { lat: 40.7000, lng: -73.9900 }, radius: 800, maxCapacity: 2000, currentOccupancy: 320, status: "Open" }
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

  const handleFindSafeRoute = () => {
    alert("Calculating route to nearest safe zone (Simulation - Requires Directions API)");
  };

  return (
    <DashboardLayout role="citizen">
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        
        {alerts.length > 0 && (
          <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <div>
                <strong className="block text-sm font-bold uppercase tracking-wider">Critical Emergency System Override</strong>
                <span className="text-base">{alerts[0].message}</span>
              </div>
            </div>
          </div>
        )}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Citizen Defense Interface</h1>
            <p className="text-secondary mt-1">Cross-reference local danger zones and map safe routes.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGetLocation} loading={locating}>
              <span className="material-symbols-outlined mr-2 text-[18px]">my_location</span>
              Sync Location
            </Button>
            <Button variant="safe" onClick={handleFindSafeRoute}>
              <span className="material-symbols-outlined mr-2 text-[18px]">directions_run</span>
              Evacuate
            </Button>
          </div>
        </header>

        <Card className="flex-1 relative overflow-hidden flex flex-col pt-4 pr-4 pl-4 pb-0 mt-4" padding="">
           <div className="absolute top-4 left-6 z-10 bg-surface-container-lowest/80 backdrop-blur px-3 py-1.5 rounded border border-outline-variant/10 shadow-sm">
             <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
               Safe Route Network Live
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

export default CitizenDashboard;
