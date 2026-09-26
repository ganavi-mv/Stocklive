import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Customer Website Pages
import CustomerHomePage from './pages/CustomerHomePage';

// Retailer / Business Website Pages
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
        {/* =================================================== */}
        {/* 1. STOCKLIVE FOR CUSTOMERS (CONSUMER WEBSITE)     */}
        {/* =================================================== */}
        <Route path="/" element={<CustomerHomePage />} />

        {/* =================================================== */}
        {/* 2. STOCKLIVE FOR BUSINESS (RETAILER WEBSITE)       */}
        {/* =================================================== */}
        <Route path="/business" element={<BusinessLandingPage />} />
        
        {/* Retailer Authentication & Management Routes */}
        <Route path="/business/register" element={<RetailerRegisterPage />} />
        <Route path="/business/login" element={<RetailerLoginPage />} />
        <Route path="/business/dashboard" element={<RetailerDashboardPage />} />
        <Route path="/business/store-profile" element={<StoreProfilePage />} />
        <Route path="/business/inventory" element={<RetailerInventoryPage />} />

        {/* Shortcuts for existing retailer URLs (Backwards compatibility) */}
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
