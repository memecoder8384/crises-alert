import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../features/auth/AuthContext';
import { generateResponse } from '../services/gemini';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ManagementPanel = () => {
  const { userRole } = useAuth();

  // Medical State
  const [medT1, setMedT1] = useState('');
  const [medT2, setMedT2] = useState('');
  const [medT3, setMedT3] = useState('');
  const [beds, setBeds] = useState('');

  // Rescue State
  const [rescuers, setRescuers] = useState('');
  const [affected, setAffected] = useState('');

  // Resource State
  const [food, setFood] = useState('');
  const [water, setWater] = useState('');
  const [medicine, setMedicine] = useState('');
  const [people, setPeople] = useState('');

  // Shelter State
  const [capacity, setCapacity] = useState('');
  const [occupancy, setOccupancy] = useState('');

  // Computations
  const totalPatients = (Number(medT1) || 0) + (Number(medT2) || 0) + (Number(medT3) || 0);
  const bedShortage = totalPatients - (Number(beds) || 0);

  const rescueWorkload = (Number(affected) || 0) / (Number(rescuers) || 1);
  const staffShortfall = Math.max(0, Math.ceil((Number(affected) || 0) / 10) - (Number(rescuers) || 0));

  const foodShortage = (Number(people) || 0) - (Number(food) || 0);
  const waterShortage = (Number(people) || 0) - (Number(water) || 0);
  const medShortage = (Number(people) || 0) - (Number(medicine) || 0);

  const shelterSpace = (Number(capacity) || 0) - (Number(occupancy) || 0);
  const shelterFull = shelterSpace <= 0 && Number(capacity) > 0;

  // AI Recommendation State
  const [aiRecs, setAiRecs] = useState({ medical: null, rescue: null, resource: null, shelter: null });
  const [loadingAi, setLoadingAi] = useState({ medical: false, rescue: false, resource: false, shelter: false });
  const [apiCache, setApiCache] = useState({});
  const [elevating, setElevating] = useState({});

  const generateAIRecommendation = async (data, type) => {
    const cacheKey = JSON.stringify({ data, type });
    if (apiCache[cacheKey]) {
      setAiRecs(prev => ({ ...prev, [type]: apiCache[cacheKey] }));
      return apiCache[cacheKey];
    }

    setLoadingAi(prev => ({ ...prev, [type]: true }));
    let prompt = `You are a tactical Crisis Response Director evaluating mathematical site telemetry. 
CRITICAL DIRECTIVE: DO NOT provide generic emergency advice (e.g. "stay calm" or "call 911"). 
Provide highly analytical, logical, and strategic deductions based STRICTLY on the numeric constraints provided below. If conditions are optimal, state them as optimal. If they represent a mathematical shortfall, explicitly calculate the precise deficit severity and state the mitigation protocol. Keep it to exactly 3 short, actionable bullet points.

${type.toUpperCase()} Data:
`;

    Object.entries(data).forEach(([key, value]) => {
      prompt += `${key}: ${value || 0}\n`;
    });
    prompt += `\nOutput format:\n1. ...\n2. ...\n3. ...`;

    try {
      const response = await generateResponse(prompt);
      let optimized = response;
      if (optimized.length > 1000) {
        optimized = optimized.substring(0, 997) + "...";
      }
      setApiCache(prev => ({ ...prev, [cacheKey]: optimized }));
      setAiRecs(prev => ({ ...prev, [type]: optimized }));
      return optimized;
    } catch (err) {
      console.error(err);
      setAiRecs(prev => ({ ...prev, [type]: "Error: Model failed to parse logistics payload. Try again." }));
      return null;
    } finally {
      setLoadingAi(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleEscalate = async (type, data, issueText) => {
    setElevating(prev => ({ ...prev, [type]: true }));
    let report = aiRecs[type];
    
    // Auto-generate AI report if it doesn't already exist for context.
    if (!report) {
       report = await generateAIRecommendation(data, type);
    }
    
    try {
      await addDoc(collection(db, 'staff_alerts'), {
        type,
        issue: issueText,
        aiReport: report || "AI analysis failed generation.",
        timestamp: serverTimestamp(),
        status: 'unread',
        reportedBy: userRole.toUpperCase() + ' TERMINAL'
      });
      alert('Alert pushed to Command Level successfully.');
    } catch(err) {
      console.error(err);
      alert('Network failure pushing alert.');
    } finally {
      setElevating(prev => ({ ...prev, [type]: false }));
    }
  };

  const AIRecommendationBlock = ({ type, data, isDeficit, issueText }) => (
    <div className="mt-4 border-t border-outline-variant/10 pt-4 shrink-0 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={() => generateAIRecommendation(data, type)} 
          disabled={loadingAi[type] || elevating[type]}
          className="flex-1 text-xs py-2 bg-surface-container-lowest"
        >
          {loadingAi[type] ? (
            <span className="flex items-center justify-center gap-2 text-primary font-bold"><span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Formulating...</span>
          ) : (
            <span className="flex items-center justify-center gap-2 font-bold"><span className="material-symbols-outlined text-primary text-[16px]">psychiatry</span> Get AI Suggestions</span>
          )}
        </Button>

        {isDeficit && (
           <Button
             onClick={() => handleEscalate(type, data, issueText)}
             disabled={elevating[type] || loadingAi[type]}
             className={`flex-1 text-xs py-2 font-bold border transition-colors ${elevating[type] ? 'bg-outline/20 text-secondary' : 'bg-error text-white border-error hover:bg-error/90'}`}
           >
              {elevating[type] ? "Reporting..." : <span className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[16px]">campaign</span> Report</span>}
           </Button>
        )}
      </div>

      {aiRecs[type] && (
        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg text-[11px] font-medium text-on-surface whitespace-pre-wrap leading-relaxed shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
          <strong className="text-primary/80 block mb-1.5 uppercase tracking-widest text-[9px] sticky top-0 bg-surface-container-low pb-1 z-10">Expert Recommendations</strong>
          <div dangerouslySetInnerHTML={{ __html: aiRecs[type].replace(/(critical|immediately|danger|alert|warning)/gi, '<span class="text-error font-bold border-b border-error/30 pb-0.5 animate-pulse bg-error/10 px-1 rounded-sm">$&</span>') }} />
        </div>
      )}
    </div>
  );

  const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg bg-surface-container-highest border-none outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <DashboardLayout role={userRole}>
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full shrink-0">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Management Panel</h1>
            <p className="text-secondary mt-1">Real-time crisis logistics calculator for field operations.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

          {/* MEDICAL CARD */}
          <Card className="flex flex-col justify-between border border-outline-variant/10">
            <div>
              <h4 className="text-base font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">medical_services</span> Medical Management
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Type 1 (Critical)</label>
                  <input type="number" placeholder="0" value={medT1} onChange={e => setMedT1(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Type 2 (Urgent)</label>
                  <input type="number" placeholder="0" value={medT2} onChange={e => setMedT2(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Type 3 (Minor)</label>
                  <input type="number" placeholder="0" value={medT3} onChange={e => setMedT3(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Available Beds</label>
                  <input type="number" placeholder="0" value={beds} onChange={e => setBeds(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-lg font-bold text-sm border ${bedShortage > 0 ? 'bg-error/10 text-error border-error/20' : totalPatients > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-surface-container text-secondary border-outline-variant/10'}`}>
              {totalPatients === 0 ? "Awaiting patient data..." : bedShortage > 0 ? `⚠ Critical: Shortage of ${bedShortage} beds` : `✓ Capacity Sufficient (${Number(beds) - totalPatients} beds open)`}
            </div>
            <AIRecommendationBlock 
              type="medical" 
              data={{ Critical: medT1, Serious: medT2, Minor: medT3, 'Available Beds': beds }} 
              isDeficit={bedShortage > 0}
              issueText={`Critical: Shortage of ${bedShortage} beds`}
            />
          </Card>

          {/* RESCUE CARD */}
          <Card className="flex flex-col justify-between border border-outline-variant/10">
            <div>
              <h4 className="text-base font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">groups</span> Rescue Operations
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Rescuers</label>
                  <input type="number" placeholder="0" value={rescuers} onChange={e => setRescuers(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Affected People</label>
                  <input type="number" placeholder="0" value={affected} onChange={e => setAffected(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-lg font-bold text-sm border ${staffShortfall > 0 ? 'bg-error/10 text-error border-error/20' : Number(affected) > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-surface-container text-secondary border-outline-variant/10'}`}>
              {Number(affected) === 0 ? "Awaiting field data..." : staffShortfall > 0 ? `⚠ High Workload (${rescueWorkload.toFixed(1)}/unit). Suggest ${staffShortfall} more staff.` : `✓ Workload Optimal (${rescueWorkload.toFixed(1)}/unit)`}
            </div>
            <AIRecommendationBlock 
              type="rescue" 
              data={{ 'Active Rescuers': rescuers, 'Affected People': affected }} 
              isDeficit={staffShortfall > 0}
              issueText={`High Rescue Workload (${rescueWorkload.toFixed(1)}/unit). Deficit of ${staffShortfall} staff.`}
            />
          </Card>

          {/* RESOURCE CARD */}
          <Card className="flex flex-col justify-between border border-outline-variant/10">
            <div>
              <h4 className="text-base font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span> Resource Flow
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Food Rations</label>
                  <input type="number" placeholder="0" value={food} onChange={e => setFood(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Water Units</label>
                  <input type="number" placeholder="0" value={water} onChange={e => setWater(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Med Kits</label>
                  <input type="number" placeholder="0" value={medicine} onChange={e => setMedicine(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total People</label>
                  <input type="number" placeholder="0" value={people} onChange={e => setPeople(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className={`p-2 px-3 rounded-lg font-bold text-xs border ${(Number(people) > 0 && foodShortage > 0) ? 'bg-error/10 text-error border-error/20' : Number(people) > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-surface-container text-secondary border-outline-variant/10'}`}>
                Food: {Number(people) === 0 ? "—" : foodShortage > 0 ? `⚠ Deficit ${foodShortage}` : "✓ Sufficient"}
              </div>
              <div className={`p-2 px-3 rounded-lg font-bold text-xs border ${(Number(people) > 0 && waterShortage > 0) ? 'bg-error/10 text-error border-error/20' : Number(people) > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-surface-container text-secondary border-outline-variant/10'}`}>
                Water: {Number(people) === 0 ? "—" : waterShortage > 0 ? `⚠ Deficit ${waterShortage}` : "✓ Sufficient"}
              </div>
              <div className={`p-2 px-3 rounded-lg font-bold text-xs border ${(Number(people) > 0 && medShortage > 0) ? 'bg-error/10 text-error border-error/20' : Number(people) > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-surface-container text-secondary border-outline-variant/10'}`}>
                Meds: {Number(people) === 0 ? "—" : medShortage > 0 ? `⚠ Deficit ${medShortage}` : "✓ Sufficient"}
              </div>
            </div>
            <AIRecommendationBlock 
              type="resource" 
              data={{ 'Food Rations': food, 'Water Units': water, 'Med Kits': medicine, 'Total People': people }} 
              isDeficit={Number(people) > 0 && (foodShortage > 0 || waterShortage > 0 || medShortage > 0)}
              issueText={`Resource Flow Imbalance! Deficits -> Food: ${foodShortage}, Water: ${waterShortage}, Meds: ${medShortage}`}
            />
          </Card>

          {/* SHELTER CARD */}
          <Card className="flex flex-col justify-between border border-outline-variant/10">
            <div>
              <h4 className="text-base font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">home_work</span> Shelter Status
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Max Capacity</label>
                  <input type="number" placeholder="0" value={capacity} onChange={e => setCapacity(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Current Occupancy</label>
                  <input type="number" placeholder="0" value={occupancy} onChange={e => setOccupancy(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-lg font-bold text-sm border ${shelterFull ? 'bg-error/10 text-error border-error/20' : Number(capacity) > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-surface-container text-secondary border-outline-variant/10'}`}>
              {Number(capacity) === 0 ? "Awaiting facility metrics..." : shelterFull ? `⚠ SHELTER FULL (Over by ${Math.abs(shelterSpace)})` : `✓ Space Available: ${shelterSpace} remaining`}
            </div>
            <AIRecommendationBlock 
              type="shelter" 
              data={{ 'Max Capacity': capacity, 'Current Occupancy': occupancy }} 
              isDeficit={shelterFull}
              issueText={`SHELTER FULL. Maximum capacity exceeded by ${Math.abs(shelterSpace)}.`}
            />
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagementPanel;
