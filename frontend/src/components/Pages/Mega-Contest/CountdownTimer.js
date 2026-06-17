import React, { useEffect, useMemo, useState } from 'react';
import { CONTEST_END_TIME, CONTEST_START_TIME } from '../../../config/contest';

const getTimeParts = (targetTime) => {
  const difference = targetTime.getTime() - Date.now();

  if (difference <= 0 || Number.isNaN(difference)) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const getTimerState = () => {
  const now = Date.now();

  if (now < CONTEST_START_TIME.getTime()) {
    return {
      title: 'Contest starts in',
      message: null,
      time: getTimeParts(CONTEST_START_TIME),
    };
  }

  if (now < CONTEST_END_TIME.getTime()) {
    return {
      title: 'Contest ends in',
      message: null,
      time: getTimeParts(CONTEST_END_TIME),
    };
  }

  return {
    title: 'Contest ended',
    message: 'The contest has ended.',
    time: { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
  };
};

const TimerBox = ({ label, value }) => (
  <div className="w-[4.1rem] rounded-lg bg-slate-950 px-2 py-3 text-center shadow-lg shadow-sky-200/40 sm:w-[4.5rem]">
    <div className="font-mono text-xl font-black text-white sm:text-2xl">
      {String(value).padStart(2, '0')}
    </div>
    <div className="mt-1 text-[0.58rem] font-black uppercase tracking-widest text-sky-300">
      {label}
    </div>
  </div>
);

const CountdownTimer = () => {
  const [timerState, setTimerState] = useState(getTimerState);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerState(getTimerState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const boxes = useMemo(
    () => [
      ['Days', timerState.time.days],
      ['Hours', timerState.time.hours],
      ['Minutes', timerState.time.minutes],
      ['Seconds', timerState.time.seconds],
    ],
    [timerState]
  );

  return (
    <section className="rounded-2xl bg-white/70 p-5 shadow-xl shadow-sky-200/45 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">
        {timerState.title}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {boxes.map(([label, value]) => (
          <TimerBox key={label} label={label} value={value} />
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-slate-700">
        Date: 21 June 2026, 11:00 AM IST
      </p>
      {timerState.message && (
        <p className="mt-3 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">
          {timerState.message}
        </p>
      )}
    </section>
  );
};

export default CountdownTimer;
