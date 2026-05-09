import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import FindParking from './pages/FindParking.jsx';
import BookingPage from './pages/BookingPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import ParkingHistory from './pages/ParkingHistory.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminMonitor from './pages/AdminMonitor.jsx';
import AdminLotManager from './pages/AdminLotManager.jsx';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('parkUser')); } catch { return null; }
};

const ProtectedUser = ({ children }) => {
  const u = getUser();
  return u && u.role === 'USER' ? children : <Navigate to="/" />;
};
const ProtectedAdmin = ({ children }) => {
  const u = getUser();
  return u && u.role === 'ADMIN' ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedUser><UserDashboard /></ProtectedUser>} />
        <Route path="/find-parking" element={<ProtectedUser><FindParking /></ProtectedUser>} />
        <Route path="/book/:lotId" element={<ProtectedUser><BookingPage /></ProtectedUser>} />
        <Route path="/payment/:bookingId" element={<ProtectedUser><PaymentPage /></ProtectedUser>} />
        <Route path="/history" element={<ProtectedUser><ParkingHistory /></ProtectedUser>} />
        <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/admin/monitor" element={<ProtectedAdmin><AdminMonitor /></ProtectedAdmin>} />
        <Route path="/admin/lots" element={<ProtectedAdmin><AdminLotManager /></ProtectedAdmin>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
