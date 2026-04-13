import React from 'react';
import { NavLink } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const Sidebar = ({ role = 'admin' }) => {
  const handleLogout = async () => {
    await signOut(auth);
  };

  const navLinks = [
    { to: `/${role}`, icon: 'map', label: 'Map View', exact: true },
    ...(role === 'staff' ? [{ to: '/staff/dashboard', icon: 'dashboard', label: 'Dashboard' }] : []),
    ...(role === 'staff' ? [{ to: '/staff/profile', icon: 'badge', label: 'Operation Profile' }] : []),
    { to: `/${role}/incidents`, icon: 'receipt_long', label: 'Incidents Feed' },
    { to: `/${role}/safe-zones`, icon: 'security', label: 'Safe Zones' },
    ...(role === 'staff' || role === 'admin' ? [{ to: `/${role}/management`, icon: 'analytics', label: 'Management Panel' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/staff-alerts', icon: 'campaign', label: 'Staff Alerts' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/tasks', icon: 'task_alt', label: 'Tasks' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/audit', icon: 'list_alt', label: 'Logs' }] : [])
  ];

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-surface-container shadow-[2px_0_15px_rgba(50,50,53,0.03)] flex flex-col justify-between hidden md:flex shrink-0 z-20">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-surface-container">
          <span className="material-symbols-outlined text-primary mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
          <h2 className="text-xl font-headline font-extrabold text-primary tracking-tight">Rescue.Net</h2>
          <span className="ml-3 text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{role}</span>
        </div>
        
        <nav className="p-4 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-[0.2em] mb-4 mt-2 px-2">Navigation</label>
          {navLinks.map((link, idx) => (
            <NavLink 
              key={idx}
              to={link.to}
              end={link.exact}
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 group ${isActive ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-secondary hover:bg-surface-container-high hover:text-on-surface border border-transparent'}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined mr-3 text-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                    {link.icon}
                  </span>
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-surface-container">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-semibold text-secondary hover:bg-error/10 hover:text-error transition-all duration-300 group border border-transparent hover:border-error/20"
        >
          <span className="material-symbols-outlined mr-3 text-[22px] group-hover:-translate-x-1 transition-transform opacity-70 group-hover:opacity-100">logout</span>
          Secure Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
