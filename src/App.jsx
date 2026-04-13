import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminTasks from './pages/AdminTasks';
import AdminLogs from './pages/AdminLogs';
import StaffAlerts from './pages/StaffAlerts';
import StaffDashboard from './pages/StaffDashboard';
import StaffMapView from './pages/StaffMapView';
import StaffProfile from './pages/StaffProfile';
import ManagementPanel from './pages/ManagementPanel';
import CitizenDashboard from './pages/CitizenDashboard';
import SafeZones from './pages/SafeZones';
import IncidentsView from './pages/IncidentsView';
import { LocationProvider } from './features/map/LocationContext';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/tasks" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTasks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/audit" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/staff-alerts" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StaffAlerts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/incidents" 
            element={<ProtectedRoute allowedRoles={['admin']}><IncidentsView /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/safe-zones" 
            element={<ProtectedRoute allowedRoles={['admin']}><SafeZones /></ProtectedRoute>} 
          />
          
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffMapView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/profile" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/incidents" 
            element={<ProtectedRoute allowedRoles={['staff']}><IncidentsView /></ProtectedRoute>} 
          />
          <Route 
            path="/staff/safe-zones" 
            element={<ProtectedRoute allowedRoles={['staff']}><SafeZones /></ProtectedRoute>} 
          />
          <Route 
            path="/staff/management" 
            element={<ProtectedRoute allowedRoles={['staff']}><ManagementPanel /></ProtectedRoute>} 
          />
          
          <Route 
            path="/citizen" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/safe-zones" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <SafeZones />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/incidents" 
            element={<ProtectedRoute allowedRoles={['citizen']}><IncidentsView /></ProtectedRoute>} 
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/citizen" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatBot />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
