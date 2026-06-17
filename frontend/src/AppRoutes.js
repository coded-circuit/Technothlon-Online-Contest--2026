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
import { Navigate, Route, Routes } from 'react-router-dom';

// Import page components
import TechnopediaLogin from './components/Pages/Technopedia/technopedia_login';
import Technopedia from './components/Pages/Technopedia/technopedia';
import TechnopediaQuestion from './components/Pages/Technopedia/technopedia-question';
import TechnopediaYear from './components/Pages/Technopedia/technopediaYear';
import Leaderboard from './components/Pages/Contest/Leaderboard';
import MegaContestLogin from './components/Pages/Mega-Contest/login';
import MegaContest from './pages/MegaContest';

import Contestlogin from './components/Pages/Contest/contest_login';
import Contest from './components/Pages/Contest/Contest';
import Question from './components/Pages/Contest/question';
import { CONTEST_END_TIME, CONTEST_START_TIME } from './config/contest';
import useAuthContext from './hooks/useAuthContext';

const ProtectedContestArena = () => {
  const { isAuthenticated } = useAuthContext();
  const now = Date.now();
  const isContestWindowOpen = now >= CONTEST_START_TIME.getTime() && now <= CONTEST_END_TIME.getTime();

  if (!isAuthenticated) return <Navigate to="/contest/login" replace />;
  return isContestWindowOpen ? <Contest /> : <Navigate to="/mega-contest" replace />;
};

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
      <Route path="/contest/arena" element={<ProtectedContestArena />} />
      <Route path="/contest/:id/:letter" element={<Question />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/mega-contest/login" element={<MegaContestLogin />} />
      <Route path="/mega-contest" element={<MegaContest />} />
       </Routes>
  );
};

export default AppRoutes;
