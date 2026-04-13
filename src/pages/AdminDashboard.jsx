import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { generateResponse } from '../services/gemini';
import MapWrapper from '../components/MapWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { db } from '../services/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useLocationStore } from '../features/map/LocationContext';

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [alertText, setAlertText] = useState('');
  const { mapCenter, userLocation, requestLocation } = useLocationStore();
  const [locating, setLocating] = useState(false);
  const [generatingAlertId, setGeneratingAlertId] = useState(null);
  
  useEffect(() => {
    const q = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inc = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setIncidents(inc);
    });
    return unsubscribe;
  }, []);

  const handleGenerateAIBroadcast = async (incident) => {
    setGeneratingAlertId(incident.id);
    try {
      const prompt = `CRITICAL TASK: Summarize this emergency incident into a concise, urgent 1-sentence public broadcast alert. 
      Incident Type: ${incident.type}. 
      Details: ${incident.description}. 
      Severity: Level ${incident.severity || 1} out of 5. 
      Do NOT include hashtags. Output ONLY the raw broadcast text.`;
      
      const aiSummary = await generateResponse(prompt);
      setAlertText(aiSummary.trim());
    } catch (err) {
      console.error("Failed to generate AI broadcast:", err);
      alert("Failed to contact Rescue.Net AI Core.");
    } finally {
      setGeneratingAlertId(null);
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!alertText.trim()) return;
    try {
      await addDoc(collection(db, 'alerts'), {
        message: alertText,
        level: 'danger',
        timestamp: serverTimestamp(),
        active: true
      });
      setAlertText('');
      alert("Alert sent successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to send alert.");
    }
  };

  const seedTestData = async () => {
    try {
      try {
        const querySnapshot = await getDocs(collection(db, 'incidents'));
        const deletions = querySnapshot.docs.map(document => deleteDoc(doc(db, 'incidents', document.id)));
        await Promise.all(deletions);
      } catch (deletionErr) {
        console.warn("Could not wipe old data, proceeding to inject anyway:", deletionErr);
      }

      // Generate structurally exact mock configurations matching the Staff Panel pipeline
      const advancedMockIncidents = [
        { type: 'Fire', description: 'Massive structural fire reported at the downtown industrial complex. Multiple units dispatched. Chemical hazards suspected.', severity: 5, active: true, specialization: 'Fire Services', location: { lat: 40.7128, lng: -74.0060 }, status: 'active', tacticalInfo: { spreadRate: 'High / Critical', hazmat: 'Yes' } },
        { type: 'Flood', description: 'Flash flooding closing major arterial roads near the eastern residential sector. Water rising rapidly over 2 feet.', severity: 3, active: true, specialization: 'General Unit', location: { lat: 40.7300, lng: -73.9900 }, status: 'active' },
        { type: 'Earthquake', description: 'Initial reports of a 4.2 magnitude tremor. Minor structural damages and scattered regional power outages confirmed.', severity: 4, active: true, specialization: 'General Unit', location: { lat: 40.7500, lng: -73.9800 }, status: 'active' },
        { type: 'Medical', description: 'Multi-vehicle collision on Interstate 95 resulting in critical casualties. Requesting immediate airlift support.', severity: 5, active: true, specialization: 'Medical Responder', location: { lat: 40.7150, lng: -74.0150 }, status: 'active', tacticalInfo: { casualties: '8', ambulances: '4' } },
        { type: 'Structural Collapse', description: 'Partial ceiling collapse at the central metro station during rush hour. Multiple citizens trapped inside.', severity: 5, active: true, specialization: 'Rescue Unit', location: { lat: 40.7200, lng: -74.0200 }, status: 'active', tacticalInfo: { trapped: '15', machinery: 'Jaws of Life, Crane' } },
        { type: 'Severe Weather', description: 'Categorized EF-2 tornado spotted touching down 5 miles west of the city limits moving Northeast at 45mph. Warning sirens activated.', severity: 4, active: true, specialization: 'General Unit', location: { lat: 40.7000, lng: -74.0500 }, status: 'active' },
        { type: 'Gas Leak', description: 'High-pressure subterranean gas main ruptured under the financial district. Extreme explosion risk. Evacuating surrounding 3 blocks.', severity: 4, active: true, specialization: 'Fire Services', location: { lat: 40.7600, lng: -73.9700 }, status: 'active', tacticalInfo: { spreadRate: 'Moderate', hazmat: 'Yes' } },
        { type: 'Civil Unrest', description: 'Aggressively escalating protests blocking major intersections in the metropolitan plaza area. Riot protocols initiated.', severity: 2, active: true, specialization: 'General Unit', location: { lat: 40.7250, lng: -73.9950 }, status: 'active' },
        { type: 'Active Threat', description: 'Reports of an armed individual barricaded inside the municipal transit hub. SWAT elements deploying. Cease immediate transit lines.', severity: 5, active: true, specialization: 'General Unit', location: { lat: 40.7400, lng: -73.9900 }, status: 'active' },
      ];
      
      let baseTime = Date.now();
      const insertPromises = advancedMockIncidents.map(inc => 
        addDoc(collection(db, 'incidents'), { ...inc, timestamp: baseTime-- })
      );
      
      await Promise.all(insertPromises);
      alert('Mock incidents successfully broadcasted to system!');
    } catch (err) {
      alert('Failed to seed data: ' + err.message);
    }
  };

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
    <DashboardLayout role="admin">
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">System Global View</h1>
            <p className="text-secondary mt-1 max-w-lg">Monitor and manage city-wide incidents with real-time telematics.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={seedTestData} className="border-amber-500/30 text-amber-600 hover:bg-amber-50">
              <span className="material-symbols-outlined mr-2 text-[18px]">bug_report</span>
              Seed Test Data
            </Button>
            <Button variant="outline" onClick={handleGetLocation} loading={locating}>
              <span className="material-symbols-outlined mr-2 text-[18px]">my_location</span>
              Sync Location
            </Button>
            <Button variant="danger" onClick={() => document.getElementById('alert-modal')?.showModal()}>
              <span className="material-symbols-outlined mr-2 text-[18px]">campaign</span>
              Broadcast Emergency
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          <Card className="lg:col-span-2 relative overflow-hidden flex flex-col pt-4 pr-4 pl-4 pb-0" padding="">
            <div className="absolute top-4 left-6 z-10 bg-surface-container-lowest/80 backdrop-blur px-3 py-1.5 rounded border border-outline-variant/10 shadow-sm">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
                Live Map Interface
              </span>
            </div>
            <div className="flex-1 rounded-t-lg overflow-hidden border border-outline-variant/10 border-b-0">
              <MapWrapper incidents={incidents} center={mapCenter} userLocation={userLocation} />
            </div>
          </Card>

          <div className="flex flex-col gap-6 overflow-y-auto">
            <Card>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center">
                <span className="material-symbols-outlined text-primary mr-2">cell_tower</span>
                Quick Broadcast
              </h3>
              <form onSubmit={handleSendAlert} className="flex flex-col gap-4">
                <Input 
                  placeholder="Type emergency alert message..." 
                  value={alertText}
                  onChange={(e) => setAlertText(e.target.value)}
                />
                <Button type="submit" variant="primary" fullWidth>Broadcast to Network</Button>
              </form>
            </Card>

            <Card className="flex-1 min-h-[300px] flex flex-col">
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2 flex items-center">
                <span className="material-symbols-outlined text-primary mr-2">receipt_long</span>
                Recent Activity
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 mt-2 space-y-3">
                {incidents.length === 0 ? (
                  <p className="text-secondary text-sm italic">No active incidents</p>
                ) : null}
                {incidents.map(inc => {
                  const severity = inc.severity || 1;
                  const isHighAlert = severity >= 4;
                  return (
                  <div key={inc.id} className={`p-3 rounded-lg border bg-surface-container-high/50 flex gap-3 transition-colors ${isHighAlert ? 'border-error/20 hover:border-error/40' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isHighAlert ? 'bg-error/10 text-error' : severity === 3 ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {inc.type === 'Fire' ? 'local_fire_department' : inc.type === 'Flood' ? 'water_damage' : inc.type === 'Earthquake' ? 'waves' : 'emergency'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-sm text-on-surface">{inc.type}</strong>
                         <div className="flex gap-0.5" title={`Severity Rating: ${severity}/5`}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1 h-2 rounded-[1px] ${i < severity ? (isHighAlert ? 'bg-error' : severity == 3 ? 'bg-amber-500' : 'bg-primary') : 'bg-outline-variant/30'}`} />
                          ))}
                         </div>
                      </div>
                      <div className="text-xs text-secondary mt-1 line-clamp-2">{inc.description}</div>
                    </div>
                    
                    <button 
                      onClick={() => handleGenerateAIBroadcast(inc)}
                      disabled={generatingAlertId === inc.id}
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">{generatingAlertId === inc.id ? 'hourglass_empty' : 'auto_awesome'}</span>
                      {generatingAlertId === inc.id ? 'Analyzing...' : 'Generate AI Broadcast'}
                    </button>
                  </div>
                )})}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
