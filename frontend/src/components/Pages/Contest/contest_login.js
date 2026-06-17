import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './contest_login.css';
import AnimatedCountdown from '../../design/countdown';
import { CONTEST_END_TIME, CONTEST_START_TIME } from '../../../config/contest';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';

// Add this utility function at the top of your component
const toProperCase = (str) => {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const TEMP_LOGIN = {
  rollNumber: 'TEMP123456',
  phone: '9999999999',
  name: 'Mega Contest Tester',
  email: 'mega.tester@technothlon.test',
  school: 'Technothlon Test School',
  city: 'Guwahati',
};
 
const StudentAuth = ({ pageTitle = 'Contest', contestPath = '/mega-contest' }) => {
  const navigate = useNavigate();
  const baseURL = process.env.NODE_ENV === "production" ? "https://technothlon.techniche.org.in" : "http://localhost:3001";

  const [isRegistered, setIsRegistered] = useState(true);
  const [newStudentMode, setNewStudentMode] = useState('signup'); // 'signup' or 'signin'
  const [formData, setFormData] = useState({
    rollNumber: '',
    phone: '',
    name: '',
    email: '',
    school: '',
    city: ''
  });
  const [message, setMessage] = useState('');
  const [contestTime, setContestTime] = useState({
    startTime: null,
    endTime: null,
    isContestStarted: false
  });

  const createTempSession = () => {
    const now = Date.now();
    localStorage.setItem('sessionId', `TEMP-MEGA-${now}`);
    localStorage.setItem('userName', TEMP_LOGIN.name);
    localStorage.setItem('userPhone', TEMP_LOGIN.phone);
    localStorage.setItem('userEmail', TEMP_LOGIN.email);
    localStorage.setItem('userRoll', TEMP_LOGIN.rollNumber);
    localStorage.setItem('userSchool', TEMP_LOGIN.school);
    localStorage.setItem('userCity', TEMP_LOGIN.city);
    localStorage.setItem('usertype', 'temporary');
    localStorage.removeItem('contestStartTime');
    localStorage.removeItem('contestEndTime');
    localStorage.removeItem('answeredQuestions');

    setMessage(`Welcome back, ${TEMP_LOGIN.name}!`);
    navigate(contestPath, { replace: true });
  };

  const isTempLogin = () => (
    formData.rollNumber.trim().toUpperCase() === TEMP_LOGIN.rollNumber &&
    formData.phone.trim() === TEMP_LOGIN.phone
  );

  useEffect(() => {
    const fetchContestTimes = async () => {
      try {
        // Fixed: Use GET request to the correct endpoint
        const response = await axios.get(`${baseURL}/api/contest/dates`);
        const { startTime, endTime } = response.data;

        const now = new Date();
        const startTimeDate = new Date(startTime);
        const endTimeDate = new Date(endTime);

        // Convert all times to timestamps for accurate comparison
        const nowTS = now.getTime();
        const startTS = startTimeDate.getTime();
        const endTS = endTimeDate.getTime();

        const isContestActive = nowTS >= startTS && nowTS <= endTS;
        
        // console.log('Time Debug:', {
        //   now: now.toISOString(),
        //   start: startTimeDate.toISOString(),
        //   end: endTimeDate.toISOString(),
        //   isActive: isContestActive
        // });

        setContestTime({
          startTime: startTimeDate,
          endTime: endTimeDate,
          isContestStarted: isContestActive
        });

      } catch (error) {
        console.error('Error fetching contest times:', error);
        const now = Date.now();
        setContestTime({
          startTime: CONTEST_START_TIME,
          endTime: CONTEST_END_TIME,
          isContestStarted: now >= CONTEST_START_TIME.getTime() && now <= CONTEST_END_TIME.getTime()
        });
      }
    };

    fetchContestTimes();
    const interval = setInterval(fetchContestTimes, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [baseURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistered && isTempLogin()) {
      createTempSession();
      return;
    }

    try {
      // For registered students (using roll number)
      if (isRegistered) {
        const response = await axios.post(`${baseURL}/api/auth/check-student`, {
          rollNumber: formData.rollNumber,
          phone: formData.phone
        });

        if (response.data.exists) {
          // Store session data
          localStorage.setItem('sessionId', `${formData.rollNumber}-${Date.now()}`);
          localStorage.setItem('userName', response.data.name);
          localStorage.setItem('userPhone', response.data.phone);
          localStorage.setItem('userRoll', formData.rollNumber);
          localStorage.setItem('userSchool', response.data.school);
          localStorage.setItem('usertype', response.data.studentType);          
          // Clear existing contest data
          localStorage.removeItem('contestStartTime');
          localStorage.removeItem('contestEndTime');
          localStorage.removeItem('answeredQuestions');
          
          setMessage(`Welcome back, ${response.data.name}!`);
          navigate(contestPath, { replace: true });
        } else {
          setMessage(response.data.message);
        }
      } 
      // For new students
      else {
        if (newStudentMode === 'signup') {
          // New student registration
          const formattedData = {
            name: formData.name,
            email: formData.email.toLowerCase(),
            phone: formData.phone,
            school: formData.school,
            city: formData.city
          };

          const response = await axios.post(`${baseURL}/api/auth/register-new`, formattedData);

          if (response.data.success) {
            setMessage(response.data.message);
            // Clear form data except email and phone for signin
            const signinData = {
              email: formData.email,
              phone: formData.phone
            };
            setFormData({...formData, ...signinData});
            setNewStudentMode('signin');
          } else {
            setMessage(response.data.message);
            if (response.data.shouldSignIn) {
              setNewStudentMode('signin');
            }
          }
        } else {
          // New student signin
          const response = await axios.post(`${baseURL}/api/auth/signin-new`, {
            email: formData.email,
            phone: formData.phone
          });

          if (response.data.success) {
            // Store session data
            localStorage.setItem('sessionId', `${response.data.email}-${Date.now()}`);
            localStorage.setItem('userName', response.data.name);
            localStorage.setItem('userPhone', response.data.phone);
            localStorage.setItem('userEmail', response.data.email);
            localStorage.setItem('userCity', response.data.city);
            localStorage.setItem('userSchool', response.data.school);
            localStorage.setItem('usertype', response.data.studentType);            
            // Clear existing contest data
            localStorage.removeItem('contestStartTime');
            localStorage.removeItem('contestEndTime');
            localStorage.removeItem('answeredQuestions');
            
            setMessage('Successfully signed in!');
            setTimeout(() => {
              navigate(contestPath, { replace: true });
            }, 1000);
          } else {
            setMessage(response.data.message);
          }
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  // Update the signin form inputs
  const renderForm = () => {
    if (isRegistered) {
      return (
        <>
          <input
            type="text"
            placeholder="Roll Number"
            value={formData.rollNumber}
            onChange={(e) => setFormData({...formData, rollNumber: e.target.value.toUpperCase()})}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
            required
          />
        </>
      );
    }

    return (
      <div className="new-student-container">
        <div className="new-student-toggle">
          <button 
            className={newStudentMode === 'signup' ? 'active' : ''} 
            onClick={() => {
              setNewStudentMode('signup');
              setMessage('');
            }}
          >
            Sign Up
          </button>
          <button 
            className={newStudentMode === 'signin' ? 'active' : ''} 
            onClick={() => {
              setNewStudentMode('signin');
              setMessage('');
            }}
          >
            Sign In
          </button>
        </div>

        {newStudentMode === 'signup' ? (
          <>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              required
            />
            <input
              type="text"
              placeholder="School Name"
              value={formData.school}
              onChange={(e) => setFormData({...formData, school: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
            />
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              required
            />
          </>
        )}
      </div>
    );
  };

  console.log('Contest Status:', {
    isContestStarted: contestTime.isContestStarted,
    now: new Date().toISOString(),
    startTime: contestTime.startTime?.toISOString(),
    endTime: contestTime.endTime?.toISOString()
  });

  return (
    <>
      <div className="auth-container">
        <div className={`countdown-wrapper ${contestTime.isContestStarted ? 'contest-started' : ''}`}>
          {contestTime.startTime && (
            <>
              <h3 className="contest-status">
                {!contestTime.isContestStarted 
                  ? "Contest starts in:" 
                  : "Contest ends in:"}
              </h3>
              <AnimatedCountdown 
                startTime={contestTime.startTime}
                endTime={contestTime.endTime}
                className="login-countdown"
                activeTimeType={!contestTime.isContestStarted ? "start" : "end"}
                showLabels={true}
                timezone="Asia/Kolkata"
              />
            </>
          )}
        </div>

        <div className="main-toggle">
          <button 
            className={isRegistered ? 'active' : ''} 
            onClick={() => setIsRegistered(true)}
          >
            Registered Student
          </button>
          <button 
            className={!isRegistered ? 'active' : ''} 
            onClick={() => setIsRegistered(false)}
          >
            New Student
          </button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="auth-form" 
          data-form-type={
            isRegistered ? undefined : 
            newStudentMode === 'signup' ? 'signup' : 'signin'
          }
        >
          <h2>
            {isRegistered ? `${pageTitle} Registered Student Login` : 
            (newStudentMode === 'signup' ? `${pageTitle} New Student Registration` : `${pageTitle} New Student Sign In`)}
          </h2>
          
          {renderForm()}

          <button type="submit" className="submit-button">
            {isRegistered ? 'Login' : 
            (newStudentMode === 'signup' ? 'Register' : 'Sign In')}
          </button>

          {/* Login is always open; exam access is controlled from Mega Contest. */}
          {!contestTime.isContestStarted && (isRegistered || newStudentMode === 'signin') && (
            <div className="timing-info">
              <small>
                You can login now. The exam arena unlocks from the Mega Contest page when the contest starts.
              </small>
            </div>
          )}
        </form>

        {message && <div className="message">{message}</div>}
      </div>
      
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        className="back-button"
        variant="contained"
      >
        Back
      </Button>
    </>
  );
};

export default StudentAuth;
