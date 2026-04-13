import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MapWrapper from '../components/MapWrapper';
import { useLocationStore } from '../features/map/LocationContext';
import { useAuth } from '../features/auth/AuthContext';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const SafeZones = () => {
  const { userLocation, requestLocation } = useLocationStore();
  const { userRole } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [locating, setLocating] = useState(false);

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      const inc = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(inc);
    });
    return unsubscribe;
  }, []);

  const safeZones = [
    { id: 1, name: "Central High School", location: { lat: 40.7100, lng: -74.0010 }, radius: 500, maxCapacity: 1000, currentOccupancy: 850, status: "Open" },
    { id: 2, name: "Safe House 2", location: { lat: 40.7150, lng: -74.0100 }, radius: 300, maxCapacity: 500, currentOccupancy: 500, status: "Full" },
    { id: 3, name: "Central Hospital", location: { lat: 40.7000, lng: -73.9900 }, radius: 800, maxCapacity: 2000, currentOccupancy: 320, status: "Open" }
  ];

  return (
    <DashboardLayout role={userRole}>
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full shrink-0">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Safe Zone Directory</h1>
            <p className="text-secondary mt-1">Real-time occupancy tracking for verified sanctuary nodes.</p>
          </div>
          <div className="flex shrink-0">
            <Button variant="outline" onClick={handleGetLocation} loading={locating}>
              <span className="material-symbols-outlined mr-2 text-[18px]">my_location</span>
              Locate
            </Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
          {/* Safe Zones Directory */}
          <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-hidden shrink-0">
            <div className="flex justify-between items-center bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/10 shrink-0">
              <span className="font-bold text-sm uppercase tracking-wider text-secondary">Safe places nearby</span>
              <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">{safeZones.length} Online</span>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 pt-1 flex-1">
              {safeZones.map(zone => {
                const occupancyPercentage = Math.round((zone.currentOccupancy / zone.maxCapacity) * 100);
                const isFull = occupancyPercentage >= 100;

                return (
                  <Card key={zone.id} className="p-5 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden group shrink-0">
                    <div
                      className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isFull ? 'bg-error' : occupancyPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                    />

                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-on-surface flex items-center gap-2 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px] text-primary">security</span>
                        {zone.name}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${isFull ? 'bg-error/10 text-error' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {zone.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/5">
                      <div>
                        <div className="text-[10px] text-secondary uppercase tracking-[0.2em] mb-1">Occupancy</div>
                        <div className="text-lg font-bold text-on-surface">
                          <span className={isFull ? "text-error" : ""}>{zone.currentOccupancy}</span>
                          <span className="text-secondary text-sm ml-1">/ {zone.maxCapacity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-secondary uppercase tracking-[0.2em] mb-1">Fill Level</div>
                        <div className={`text-lg font-bold ${isFull ? 'text-error' : occupancyPercentage > 75 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {occupancyPercentage}%
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <Card className="flex-1 relative overflow-hidden flex flex-col pt-4 pr-4 pl-4 pb-0 border border-outline-variant/10 min-h-[400px] lg:min-h-full" padding="">
            <div className="absolute top-4 left-6 z-10 bg-surface-container-lowest/80 backdrop-blur px-3 py-1.5 rounded border border-outline-variant/10 shadow-sm">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                Sanctuary Net
              </span>
            </div>
            <div className="flex-1 rounded-t-lg overflow-hidden border border-outline-variant/10 border-b-0 h-full">
              <MapWrapper incidents={incidents} safeZones={safeZones} center={userLocation || safeZones[0].location} userLocation={userLocation} zoom={13} />
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SafeZones;
