import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ServicesList from './components/ServicesList';
import PaymentStatus from './components/PaymentStatus';

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<ServicesList />} />
      <Route path='/payment/:orderId' element={<PaymentStatus />} />
    </Routes>
  );
};

export default Router;
