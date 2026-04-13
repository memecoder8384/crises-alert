import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const StaffProfile = () => {
  const [specialization, setSpecialization] = useState('General Unit');
  const [team, setTeam] = useState('Alpha Squad');

  useEffect(() => {
    const savedSpec = window.localStorage.getItem('staff_specialization');
    if (savedSpec) setSpecialization(savedSpec);
    
    const savedTeam = window.localStorage.getItem('staff_team');
    if (savedTeam) setTeam(savedTeam);
  }, []);

  const handleSave = () => {
    window.localStorage.setItem('staff_specialization', specialization);
    window.localStorage.setItem('staff_team', team);
    alert('Specialization and Team designation updated successfully! Telemetry protocols unlocked.');
  };

  const roles = [
    { name: 'General Unit', icon: 'security', desc: 'Standard incident mapping and perimeter control.' },
    { name: 'Medical Responder', icon: 'medical_services', desc: 'Triage arrays, casualty tracking, and EMS dispatch.' },
    { name: 'Rescue Unit', icon: 'front_loader', desc: 'Heavy machinery tracking and structural extraction analysis.' },
    { name: 'Fire Services', icon: 'local_fire_department', desc: 'Burn spread metrics, HAZMAT tracking, and multi-alarm escalation.' }
  ];

  const teams = [
    { name: 'Alpha Squad', icon: 'group_work', desc: 'Immediate frontline response and command. Sectors 1-4.' },
    { name: 'Bravo Squad', icon: 'diversity_3', desc: 'Secondary support and heavy lifting reinforcement. Sectors 5-8.' },
    { name: 'Charlie Squad', icon: 'groups', desc: 'Rapid reconnaissance and triage assessment. Mobile unit.' },
    { name: 'Delta Squad', icon: 'shield_locked', desc: 'Hazardous material containment and specialized containment.' }
  ];

  return (
    <DashboardLayout role="staff">
       <div className="h-full w-full flex flex-col space-y-6 text-left">
           <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
            <div>
              <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Agent Designation</h1>
              <p className="text-secondary mt-1 max-w-lg">Configure your field designation and team affiliation to unlock specialized telemetry protocols.</p>
            </div>
            <Button variant="primary" onClick={handleSave} className="hidden sm:inline-flex px-8">
               <span className="material-symbols-outlined mr-2">save</span>
               Save Configuration
            </Button>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
             <Card>
               <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center">
                 <span className="material-symbols-outlined text-primary mr-2">badge</span>
                 Select Division Assignment
               </h3>
               
               <div className="flex flex-col gap-3">
                 {roles.map(r => (
                   <div 
                     key={r.name} 
                     onClick={() => setSpecialization(r.name)}
                     className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${specialization === r.name ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-outline-variant/20 hover:border-primary/50 bg-surface-container-high/30'}`}
                   >
                     <div className={`p-4 rounded-lg shadow-sm transition-colors ${specialization === r.name ? 'bg-primary text-on-primary shadow-primary/20' : 'bg-surface-container-highest text-secondary'}`}>
                        <span className="material-symbols-outlined text-[28px]">{r.icon}</span>
                     </div>
                     <div>
                       <strong className="block text-on-surface text-lg font-headline">{r.name}</strong>
                       <span className="text-sm text-secondary mt-0.5 block">{r.desc}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </Card>

             <Card>
               <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center">
                 <span className="material-symbols-outlined text-primary mr-2">group</span>
                 Select Strike Team Affiliation
               </h3>
               
               <div className="flex flex-col gap-3">
                 {teams.map(t => (
                   <div 
                     key={t.name} 
                     onClick={() => setTeam(t.name)}
                     className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${team === t.name ? 'border-emerald-600 bg-emerald-500/5 ring-4 ring-emerald-500/10' : 'border-outline-variant/20 hover:border-emerald-500/50 bg-surface-container-high/30'}`}
                   >
                     <div className={`p-4 rounded-lg shadow-sm transition-colors ${team === t.name ? 'bg-emerald-600 text-on-primary shadow-emerald-500/20' : 'bg-surface-container-highest text-secondary'}`}>
                        <span className="material-symbols-outlined text-[28px]">{t.icon}</span>
                     </div>
                     <div>
                       <strong className="block text-on-surface text-lg font-headline">{t.name}</strong>
                       <span className="text-sm text-secondary mt-0.5 block">{t.desc}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </Card>

             {/* Mobile-only save button at the bottom */}
             <div className="sm:hidden mt-4">
                 <Button variant="primary" onClick={handleSave} className="w-full py-4 text-lg">Save Configuration</Button>
             </div>
           </div>
       </div>
    </DashboardLayout>
  )
}
export default StaffProfile;
