import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { db } from '../services/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { useLocationStore } from '../features/map/LocationContext';
import { useNavigate } from 'react-router-dom';

const LocationName = ({ lat, lng }) => {
  const [address, setAddress] = useState('Resolving location...');
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setAddress('Map API Key missing');
          return;
        }
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setAddress(data.results[0].formatted_address);
        } else {
          setAddress('Unknown Location');
        }
      } catch (err) {
        setAddress('Address unavailable');
      }
    };
    fetchAddress();
  }, [lat, lng]);
  return <span>{address}</span>;
};

const IncidentsView = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { setMapCenter } = useLocationStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      const inc = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidents(inc);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSeedData = async () => {
    const mockIncidents = [
      { type: 'Fire', description: 'Category 5 chemical fire in industrial sector. Highly volatile.', status: 'critical', severity: 5, location: { lat: 40.7128, lng: -74.0060 } },
      { type: 'Medical', description: 'Mass-casualty collision on interstate.', status: 'active', severity: 4, location: { lat: 40.7282, lng: -73.7949 } },
      { type: 'Flood', description: 'Flash flooding on main avenue. Water level rising aggressively.', status: 'active', severity: 3, location: { lat: 40.7484, lng: -73.9857 } },
      { type: 'Earthquake', description: 'Magnitude 4.2 tremor. Structural damage to old municipal buildings.', status: 'active', severity: 4, location: { lat: 40.7300, lng: -73.9950 } },
      { type: 'Structural Collapse', description: 'Partial roof collapse at abandoned manufacturing plant.', status: 'contained', severity: 2, location: { lat: 40.7010, lng: -74.0150 } },
      { type: 'Fire', description: 'Small localized brush fire near highway interchange.', status: 'contained', severity: 1, location: { lat: 40.7820, lng: -73.9650 } },
      { type: 'Medical', description: 'Heat stroke emergency at community center.', status: 'resolved', severity: 1, location: { lat: 40.7580, lng: -73.9855 } }
    ];
    for (let incident of mockIncidents) {
      await addDoc(collection(db, 'incidents'), {
        ...incident,
        reportedBy: 'system-seed',
        timestamp: serverTimestamp()
      });
    }
  };

  const handleIncidentClick = (location) => {
    if (!location) return;
    setMapCenter(location);
    const targetPath = userRole === 'admin' ? '/admin' : userRole === 'staff' ? '/staff' : '/citizen';
    navigate(targetPath);
  };

  return (
    <DashboardLayout role={userRole || 'citizen'}>
      <div className="h-full w-full flex flex-col space-y-6 pb-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Incidents Feed</h1>
            <p className="text-secondary mt-1">Live ledger of all reported emergency telematics.</p>
          </div>
          {incidents.length === 0 && (
            <Button onClick={handleSeedData} variant="primary">
              <span className="material-symbols-outlined mr-2 text-[18px]">database</span>
              Seed System Data
            </Button>
          )}
        </header>

        {loading ? (
          <div className="flex-1 flex justify-center items-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-[32px] animate-spin mr-3">progress_activity</span>
            <span className="font-bold tracking-widest uppercase">Connecting to ledger...</span>
          </div>
        ) : incidents.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center bg-surface-container-low/50 border-dashed border-2">
            <span className="material-symbols-outlined text-[48px] text-outline opacity-50 mb-4 block">fact_check</span>
            <p className="text-secondary font-medium">No active emergencies detected.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {incidents.map(inc => (
              <Card 
                key={inc.id} 
                className="flex flex-col relative group cursor-pointer hover:border-primary/40 hover:-translate-y-1" 
                padding="p-5"
                onClick={() => handleIncidentClick(inc.location)}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-primary">arrow_outward</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${inc.severity >= 4 ? 'text-error bg-error/10' : inc.severity == 3 ? 'text-amber-600 bg-amber-500/10' : 'text-primary bg-primary/10'}`}>
                    <span className="material-symbols-outlined text-[24px]">
                      {inc.type === 'Fire' ? 'local_fire_department' : inc.type === 'Flood' ? 'water_damage' : inc.type === 'Earthquake' ? 'waves' : 'emergency'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-headline font-bold text-on-surface leading-tight mb-1">{inc.type} Incident</h3>
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 inline-block text-[9px] font-bold uppercase tracking-wider rounded-sm ${inc.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' : inc.status === 'contained' ? 'bg-amber-500/10 text-amber-600' : 'bg-error/10 text-error'}`}>{inc.status}</span>
                       <div className="flex gap-0.5 ml-2" title={`Severity Rating: ${inc.severity || 1}/5`}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1.5 h-2.5 rounded-sm ${i < (inc.severity || 1) ? (inc.severity >= 4 ? 'bg-error' : inc.severity == 3 ? 'bg-amber-500' : 'bg-primary') : 'bg-outline-variant/30'}`} />
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
                <p className="text-secondary text-sm flex-1 mb-4">{inc.description}</p>
                
                <div className="bg-surface-container-high rounded p-3 text-xs space-y-2 mt-auto">
                   <div className="flex justify-between items-center text-on-surface">
                     <span className="text-outline uppercase font-bold tracking-widest text-[9px]">Coordinates</span>
                     <span className="font-mono">{inc.location?.lat.toFixed(4)}, {inc.location?.lng.toFixed(4)}</span>
                   </div>
                   <div className="flex justify-between items-start text-on-surface">
                     <span className="text-outline uppercase font-bold tracking-widest text-[9px] mt-0.5">Geozone</span>
                     <span className="text-error font-medium truncate max-w-[150px] text-right"><LocationName lat={inc.location?.lat} lng={inc.location?.lng} /></span>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IncidentsView;
