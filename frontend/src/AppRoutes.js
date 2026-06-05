// AppRoutes.js
/**
 * Application Route Configuration
 * 
 * Defines all client-side routes for Technothlon application
 * Uses React Router v6 for SPA navigation
 * 
 * Routes:
 * - /technopedia-login: User authentication
 * - /technopedia: Year selection 
 * - /technopedia/:year: Questions list
 * - /technopedia/:year/:id/:letter: Individual question
 */
// Defines all routes and navigation paths for the application
// Maps URL paths to their corresponding components

import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import page components
import TechnopediaLogin from './components/Pages/Technopedia/technopedia_login';
import Technopedia from './components/Pages/Technopedia/technopedia';
import TechnopediaQuestion from './components/Pages/Technopedia/technopedia-question';
import TechnopediaYear from './components/Pages/Technopedia/technopediaYear';

// Define all application routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Technopedia login page */}
      <Route path="/technopedia-login" element={<TechnopediaLogin />} />
      {/* Question page with dynamic year, id, and letter parameters */}
      <Route path="/technopedia/:year/:id/:letter" element={<TechnopediaQuestion />} />
      {/* Year selection page */}
      <Route path="/technopedia" element={<TechnopediaYear />} />
      {/* Questions list for a specific year */}
      <Route path='/technopedia/:year' element={<Technopedia/>}/>
       </Routes>
  );
};

export default AppRoutes;
