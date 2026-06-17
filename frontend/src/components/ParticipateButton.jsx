import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getPhase = (contestStartTime, contestEndTime) => {
  if (!contestStartTime || !contestEndTime) return 'unavailable';
  const now = Date.now();
  if (now < contestStartTime.getTime()) return 'before';
  if (now > contestEndTime.getTime()) return 'ended';
  return 'live';
};

const ParticipateButton = ({ contestStartTime, contestEndTime, isContestActive = null }) => {
  const navigate = useNavigate();
  const [contestWindow, setContestWindow] = useState({ startTime: contestStartTime, endTime: contestEndTime });
  const [phase, setPhase] = useState(() => getPhase(contestStartTime, contestEndTime));
  const [activeStatus, setActiveStatus] = useState(isContestActive);
  const [scheduleStatus, setScheduleStatus] = useState('loading');
  const [attemptStatus, setAttemptStatus] = useState({ isStarted: false, isCompleted: false });

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(getPhase(contestWindow.startTime, contestWindow.endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [contestWindow]);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const datesResponse = await fetch('/api/contest/dates');
        if (datesResponse.ok) {
          const dates = await datesResponse.json();
          if (isMounted) {
            setContestWindow({
              startTime: new Date(dates.startTime),
              endTime: new Date(dates.endTime),
            });
            setScheduleStatus('ready');
          }
        } else {
          throw new Error('Unable to load contest dates');
        }
      } catch (error) {
        if (isMounted) {
          setContestWindow({ startTime: null, endTime: null });
          setScheduleStatus('error');
        }
      }

      if (typeof isContestActive === 'boolean') {
        setActiveStatus(isContestActive);
        return;
      }

      try {
        const response = await fetch('/api/contest/status');
        if (!response.ok) throw new Error('Unable to load contest status');
        const data = await response.json();
        if (isMounted) {
          setActiveStatus(typeof data.isContestActive === 'boolean' ? data.isContestActive : null);
        }
      } catch (error) {
        if (isMounted) setActiveStatus(isContestActive);
      }

      try {
        const phone = localStorage.getItem('userPhone');
        if (!phone) return;
        const scoreResponse = await fetch(`/api/contest/score?phone=${encodeURIComponent(phone)}`);
        if (!scoreResponse.ok) throw new Error('Unable to load contest attempt status');
        const scoreData = await scoreResponse.json();
        if (isMounted) {
          setAttemptStatus({
            isStarted: Boolean(scoreData.isStarted),
            isCompleted: Boolean(scoreData.isCompleted),
          });
        }
      } catch (error) {
        if (isMounted) setAttemptStatus({ isStarted: false, isCompleted: false });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [contestEndTime, contestStartTime, isContestActive]);

  const buttonState = useMemo(() => {
    if (scheduleStatus === 'error' || phase === 'unavailable') {
      return {
        disabled: true,
        label: 'Contest timing unavailable',
        status: 'Please refresh after a moment.',
      };
    }

    if (attemptStatus.isCompleted) {
      return {
        disabled: true,
        label: 'You have submitted the contest',
        status: 'Your contest attempt is already submitted.',
      };
    }

    if (attemptStatus.isStarted) {
      return {
        disabled: true,
        label: 'Contest already in progress',
        status: 'Your contest attempt has already started.',
      };
    }

    if (phase === 'ended') {
      return {
        disabled: true,
        label: 'Contest Has Ended',
        status: '🔒 Contest has ended. Thank you for participating.',
      };
    }

    if (phase === 'live' && activeStatus !== false) {
      return {
        disabled: false,
        label: 'PARTICIPATE NOW 🚀',
        status: '✅ Contest is LIVE - Good luck!',
      };
    }

    return {
      disabled: true,
      label: 'Contest Not Started Yet',
      status: '⏳ Contest begins 21 June 2026, 11:00 AM IST',
    };
  }, [activeStatus, attemptStatus, phase, scheduleStatus]);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6 text-center shadow-xl shadow-sky-300/25 backdrop-blur">
      <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-sky-300/25 blur-2xl" />
      <div className="absolute bottom-6 right-10 h-24 w-24 rounded-full bg-blue-300/20 blur-2xl" />
      <p className="relative mb-2 text-xs font-black uppercase tracking-[0.28em] text-sky-700">
        Ready to Compete
      </p>
      <h2 className="relative text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
        Start Your Contest
        <span className="block bg-gradient-to-r from-sky-700 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
          Journey 🚀
        </span>
      </h2>
      <p className="relative mt-2 text-sm font-semibold text-slate-600">
        Arena unlocks when countdown reaches zero.
      </p>
      <button
        type="button"
        disabled={buttonState.disabled}
        onClick={() => navigate('/contest/arena')}
        className={`relative mt-6 rounded-2xl px-10 py-4 text-base font-black uppercase tracking-widest text-white shadow-xl transition ${
          buttonState.disabled
            ? 'cursor-not-allowed bg-slate-400 shadow-slate-300/25'
            : 'bg-gradient-to-r from-sky-600 to-blue-700 shadow-blue-400/25 hover:-translate-y-1 hover:from-sky-500 hover:to-blue-600'
        }`}
      >
        {buttonState.label}
      </button>
      <p className="relative mt-3 text-sm font-bold text-slate-600">{buttonState.status}</p>
    </section>
  );
};

export default ParticipateButton;
