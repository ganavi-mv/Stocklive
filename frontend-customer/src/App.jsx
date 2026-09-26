import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerHomePage from './pages/CustomerHomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerHomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
