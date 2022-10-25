import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from '../views/auth/Dashboard';
import History from '../views/auth/History';
import MultiTransfer from '../views/auth/MultiTransfer';
import Swap from '../views/auth/Swap';

const AppRoute = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/history" element={<History />} />
        <Route exact path="/multi-send" element={<MultiTransfer />} />
        <Route exact path="/swap" element={<Swap />} />
      </Routes>
    </Router>
  );
};

export default AppRoute;
