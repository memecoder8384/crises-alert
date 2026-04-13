import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const StaffDashboard = () => {
  const [type, setType] = useState('Fire');
  const [desc, setDesc] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [severity, setSeverity] = useState(3);
  
  // Tactical fields
  const [specialization, setSpecialization] = useState('General Unit');
  const [casualties, setCasualties] = useState('');
  const [ambulances, setAmbulances] = useState('');
  const [trapped, setTrapped] = useState('');
  const [machinery, setMachinery] = useState('');
  const [spreadRate, setSpreadRate] = useState('');
  const [hazmat, setHazmat] = useState('');

  useEffect(() => {
    setSpecialization(window.localStorage.getItem('staff_specialization') || 'General Unit');
  }, []);

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      const telemetry = {
        type,
        description: desc,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        reportedBy: 'staff-member',
        specialization,
        status: 'active',
        severity: parseInt(severity, 10),
        timestamp: serverTimestamp()
      };

      if (specialization === 'Medical Responder') {
        telemetry.tacticalInfo = { casualties, ambulances };
      } else if (specialization === 'Rescue Unit') {
        telemetry.tacticalInfo = { trapped, machinery };
      } else if (specialization === 'Fire Services') {
        telemetry.tacticalInfo = { spreadRate, hazmat };
      }

      await addDoc(collection(db, 'incidents'), telemetry);
      alert('Tactical Telemetry Uploaded Successfully!');
      
      setDesc(''); setLat(''); setLng(''); setSeverity(3);
      setCasualties(''); setAmbulances(''); setTrapped(''); setMachinery(''); setSpreadRate(''); setHazmat('');
    } catch (err) {
      console.error(err);
      alert('Failed to report telemetry');
    }
  };

  return (
    <DashboardLayout role="staff">
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Field Agent Terminal</h1>
            <p className="text-secondary mt-1 max-w-lg">Report immediate ground incidents and coordinate recovery zones.</p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined text-primary mr-2">add_alert</span>
              Register Ground Incident
            </h3>
            <form onSubmit={handleReport} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-wider">Classification</label>
                  <select className="w-full px-4 py-3.5 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface outline-none" value={type} onChange={e => setType(e.target.value)}>
                    <option>Fire</option>
                    <option>Flood</option>
                    <option>Medical</option>
                    <option>Structural Collapse</option>
                    <option>Earthquake</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-wider">Threat Level (1-5)</label>
                  <select className="w-full px-4 py-3.5 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface outline-none font-mono" value={severity} onChange={e => setSeverity(e.target.value)}>
                    <option value="1">Level 1 - Minor</option>
                    <option value="2">Level 2 - Contained</option>
                    <option value="3">Level 3 - Serious</option>
                    <option value="4">Level 4 - Critical</option>
                    <option value="5">Level 5 - Catastrophic</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Telemetry Injector block based on specialization */}
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">psychiatry</span>
                  {specialization} Telemetry
                </h4>

                {specialization === 'Medical Responder' && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Est. Casualties" type="number" required value={casualties} onChange={e=>setCasualties(e.target.value)} />
                      <Input label="Ambulances Needed" type="number" required value={ambulances} onChange={e=>setAmbulances(e.target.value)} />
                    </div>
                )}
                {specialization === 'Rescue Unit' && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Trapped Individuals" type="number" required value={trapped} onChange={e=>setTrapped(e.target.value)} />
                      <Input label="Heavy Mach. Req." type="text" placeholder="e.g. Crane, Jaws" value={machinery} onChange={e=>setMachinery(e.target.value)} required />
                    </div>
                )}
                {specialization === 'Fire Services' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-primary uppercase tracking-wider">Spread Rate</label>
                        <select className="w-full px-4 py-3.5 rounded-lg bg-surface-container-highest border-none focus:outline-none" value={spreadRate} onChange={e=>setSpreadRate(e.target.value)} required>
                          <option value="">Select...</option>
                          <option>Low / Smoldering</option>
                          <option>Moderate</option>
                          <option>High / Critical</option>
                        </select>
                      </div>
                      <Input label="HAZMAT Presence" type="text" placeholder="Yes / No" value={hazmat} onChange={e=>setHazmat(e.target.value)} required />
                    </div>
                )}
                {specialization === 'General Unit' && (
                    <div className="text-xs text-secondary italic border-t border-outline-variant/10 pt-2">Standard telemetry only. Navigate to your Profile tab to unlock advanced tactical payload tools.</div>
                )}
              </div>
              
              <Input label="Direct Observation (Description)" value={desc} onChange={e => setDesc(e.target.value)} required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude" type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} required />
                <Input label="Longitude" type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} required />
              </div>
              
              <div className="pt-2">
                <Button type="submit" variant="primary" fullWidth>Upload Telemetry</Button>
              </div>
            </form>
          </Card>
          
          <Card className="flex flex-col bg-surface-container-low/50">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-4 flex items-center">
              <span className="material-symbols-outlined text-primary mr-2">assignment</span>
              Active Assignments
            </h3>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-lg p-12 text-center">
              <div>
                <span className="material-symbols-outlined text-[48px] text-outline opacity-50 mb-4 block">assignment_turned_in</span>
                <p className="text-secondary font-medium">No pending objectives.</p>
                <p className="text-xs text-outline mt-1">Stand by for command orders.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
