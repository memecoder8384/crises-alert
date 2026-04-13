/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin', 'staff', 'citizen'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let roleUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true); // Lock the UI until role is verified
        setCurrentUser(user);
        
        // 1. Establish absolute truth securely from server to unblock UI
        getDoc(doc(db, 'users', user.uid)).then(userDoc => {
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            // Only gracefully fallback if strictly missing from server db
            setUserRole('citizen');
          }
          setLoading(false);
          
          // 2. Attach background snapshot listener for live role alterations
          roleUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) setUserRole(snap.data().role);
          });
        }).catch(error => {
          console.error("Error verifying user role constraint:", error);
          setUserRole('citizen');
          setLoading(false);
        });

      } else {
        if (roleUnsubscribe) {
          roleUnsubscribe();
          roleUnsubscribe = null;
        }
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (roleUnsubscribe) roleUnsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    setUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
