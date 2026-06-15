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
import Leaderboard from './components/Pages/Contest/Leaderboard';

import Contestlogin from './components/Pages/Contest/contest_login';
import Contest from './components/Pages/Contest/Contest';
import Question from './components/Pages/Contest/question';

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




         {/* Contest Routes */}
      <Route path="/contest/login" element={<Contestlogin />} />
      <Route path="/contest" element={<Contest />} />
      <Route path="/contest/:id/:letter" element={<Question />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
       </Routes>
  );
};

export default AppRoutes;
