import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BusinessLandingPage from './pages/BusinessLandingPage';
import RetailerRegisterPage from './pages/RetailerRegisterPage';
import RetailerLoginPage from './pages/RetailerLoginPage';
import RetailerDashboardPage from './pages/RetailerDashboardPage';
import StoreProfilePage from './pages/StoreProfilePage';
import RetailerInventoryPage from './pages/RetailerInventoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BusinessLandingPage />} />
        <Route path="/register" element={<RetailerRegisterPage />} />
        <Route path="/login" element={<RetailerLoginPage />} />
        <Route path="/dashboard" element={<RetailerDashboardPage />} />
        <Route path="/store-profile" element={<StoreProfilePage />} />
        <Route path="/inventory" element={<RetailerInventoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
