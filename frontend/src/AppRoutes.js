// AppRoutes.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';


import TechnopediaLogin from './components/Pages/Technopedia/technopedia_login';
import Technopedia from './components/Pages/Technopedia/technopedia';
import TechnopediaQuestion from './components/Pages/Technopedia/technopedia-question';


const AppRoutes = () => {
  return (
    <Routes>




      <Route path="/technopedia-login" element={<TechnopediaLogin />} />
      <Route path="/technopedia" element={<Technopedia />} />
       </Routes>
  );
};

export default AppRoutes;
