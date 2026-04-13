import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useLocationStore } from '../features/map/LocationContext';
import Loader from '../components/ui/Loader';

const Login = () => {
  const { currentUser, userRole, loading: authLoading, setUserRole } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Inject safety fallback timeout to natively kill hanging loaders
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setLoading(false);
        setError("Network response delayed. Please verify internet connection or try again.");
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [loading]);
  const [selectedRole, setSelectedRole] = useState('citizen');
  const { requestLocation } = useLocationStore();

  useEffect(() => {
    requestLocation(
      () => console.log('Location pre-fetched successfully.'),
      (err) => console.log('Location pre-fetch skipped or denied:', err.message)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Lock the screen immediately if local submission or global auth is loading
  if (authLoading || loading) {
    return <Loader message="Establishing Secure Connection..." />;
  }

  // 2. Only auto-redirect isolated visitors who are already fully authenticated
  if (currentUser && userRole) {
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/citizen" replace />;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let role = 'citizen';

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        role = selectedRole;
        try {
          // Await the profile generation but swallow sync errors so we don't hardlock the user login flow
          await setDoc(doc(db, 'users', user.uid), { role });
        } catch (dbErr) {
          console.warn("Server delayed processing profile attachment, authorizing local session anyway.", dbErr);
        }
        
        // Immediately sync the global Auth Context state to avoid race conditions with the ProtectedRoutes evaluating default 'citizen' roles.
        if (setUserRole) setUserRole(role);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        // Auto-resolve role purely from central database
        let actualRole = 'citizen';
        if (userDoc.exists()) {
          actualRole = userDoc.data().role;
        }
        
        role = actualRole;
        if (setUserRole) setUserRole(role);
      }
      
      // Explicitly detach local UI lock BEFORE issuing router jump
      setLoading(false);
      
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'staff') navigate('/staff', { replace: true });
      else navigate('/citizen', { replace: true });
      
    } catch (err) {
      console.error(err);
      const cleanError = err.message ? err.message.replace('Firebase:', '').trim() : 'An error occurred';
      setError(cleanError);
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">
      <header className="fixed top-0 w-full z-50 bg-[#fcf8f9] bg-opacity-80 backdrop-blur-xl">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-full mx-auto">
          <div className="text-xl font-bold tracking-tighter text-primary">Rescue.Net</div>
        </div>
        <div className="bg-surface-variant h-[1px] w-full absolute bottom-0"></div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-16 px-4 relative">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-12 relative z-10">
          
          <div className="lg:col-span-7 hidden lg:flex flex-col p-12 rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-label text-xs font-semibold mb-6">
                CRISIS FRAMEWORK v2.4
              </span>
              <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface leading-tight mb-6">
                Clarity in the <br/><span className="text-primary">heart of the storm.</span>
              </h1>
              <p className="text-lg text-secondary leading-relaxed max-w-md">
                Access your secure dashboard to manage protocols, track real-time stability, and orchestrate critical response units with architectural precision.
              </p>
            </div>
            
            <div className="mt-12 relative z-10 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <span className="material-symbols-outlined text-primary mb-3">shield_with_heart</span>
                <div className="text-sm font-bold text-on-surface">Secure Protocol</div>
                <div className="text-xs text-secondary mt-1">End-to-end encryption for all incident data.</div>
              </div>
              <div className="p-6 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <span className="material-symbols-outlined text-primary mb-3">architecture</span>
                <div className="text-sm font-bold text-on-surface">Architectural Order</div>
                <div className="text-xs text-secondary mt-1">Structured workflows for high-stress environments.</div>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl mix-blend-multiply"></div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-lg border border-outline-variant/10">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">{isSignUp ? 'Create Rescue Account' : 'Sign In'}</h2>
                <p className="text-secondary text-sm">{isSignUp ? 'Join the network' : 'Enter your credentials to access the sanctuary.'}</p>
              </div>

              {error && <div className="p-3 mb-6 bg-error-container/20 text-error text-sm rounded-lg border border-error/10">{error}</div>}

              <form className="space-y-6" onSubmit={handleAuth}>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-wider" htmlFor="email">Email Address</label>
                  <input 
                    className="w-full px-4 py-4 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline-variant" 
                    id="email" 
                    name="email" 
                    placeholder="name@organization.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wider" htmlFor="password">Password</label>
                  </div>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-4 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline-variant pr-12" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                  {isSignUp && (
                    <div className="mb-4 space-y-2 mt-4">
                      <label className="block text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 text-center lg:text-left opacity-80">Select Access Profile</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          type="button"
                          onClick={() => setSelectedRole('citizen')}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md ${selectedRole === 'citizen' ? 'border-primary bg-primary/5 text-primary scale-105 shadow-md' : 'border-transparent bg-surface-container-high text-secondary hover:border-outline-variant/30'}`}
                        >
                          <span className="material-symbols-outlined mb-1 text-xl group-hover:scale-110 transition-transform duration-300">person</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Citizen</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSelectedRole('admin')}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md ${selectedRole === 'admin' ? 'border-primary bg-primary/5 text-primary scale-105 shadow-md' : 'border-transparent bg-surface-container-high text-secondary hover:border-outline-variant/30'}`}
                        >
                          <span className="material-symbols-outlined mb-1 text-xl group-hover:scale-110 transition-transform duration-300">admin_panel_settings</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSelectedRole('staff')}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md ${selectedRole === 'staff' ? 'border-primary bg-primary/5 text-primary scale-105 shadow-md' : 'border-transparent bg-surface-container-high text-secondary hover:border-outline-variant/30'}`}
                        >
                          <span className="material-symbols-outlined mb-1 text-xl group-hover:scale-110 transition-transform duration-300">badge</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Staff</span>
                        </button>
                      </div>
                    </div>
                  )}

                <button 
                  className="w-full mt-4 py-4 px-6 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-lg active:scale-95 hover:-translate-y-0.5 hover:shadow-primary/30 transition-all duration-300 shadow-lg shadow-primary/10" 
                  type="submit"
                >
                  {isSignUp ? 'Establish Ground Link' : 'Access Dashboard'}
                </button>
              </form>

              <div className="mt-10 text-center">
                <span className="text-sm text-secondary">{isSignUp ? 'Already cleared?' : "Don't have an account?"} </span>
                <button 
                  className="text-sm font-bold text-primary hover:text-primary-dim transition-colors" 
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  type="button"
                >
                  {isSignUp ? 'Sign in' : 'Create an Account'}
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-center lg:justify-start gap-4 opacity-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="text-[10px] font-semibold tracking-widest uppercase">SSL SECURE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                <span className="text-[10px] font-semibold tracking-widest uppercase">Uptime 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
