import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticipateButton from '../components/ParticipateButton';
import ProfileDropdown from '../components/ProfileDropdown';
import CountdownTimer from '../components/Pages/Mega-Contest/CountdownTimer';
import Footer from '../components/Pages/Mega-Contest/Footer';
import PrizesSection from '../components/Pages/Mega-Contest/PrizesSection';
import ResourcesGrid from '../components/Pages/Mega-Contest/ResourcesGrid';
import { CONTEST_END_TIME, CONTEST_START_TIME } from '../config/contest';
import useAuthContext from '../hooks/useAuthContext';

const REGISTRATION_DISPLAY_OFFSET = 2000;

const useContestStats = () => {
  const [registeredCount, setRegisteredCount] = useState(null);
  const [statsStatus, setStatsStatus] = useState('loading');

  useEffect(() => {
    const fetchStats = async (showSkeleton = false) => {
      try {
        if (showSkeleton) setStatsStatus('loading');
        const response = await fetch('/api/contest/stats');
        if (!response.ok) throw new Error('Unable to fetch contest stats');
        const data = await response.json();
        setRegisteredCount(Number(data.registeredCount) || 0);
        setStatsStatus('success');
      } catch (error) {
        console.error('Mega Contest stats error:', error);
        setStatsStatus('error');
      }
    };

    fetchStats(true);
    const statsInterval = setInterval(() => fetchStats(false), 30000);
    return () => clearInterval(statsInterval);
  }, []);

  const countText = useMemo(() => {
    if (statsStatus === 'error') return 'Registration count unavailable';
    if (registeredCount === null) return '';
    return `${(registeredCount + REGISTRATION_DISPLAY_OFFSET).toLocaleString('en-IN')} students registered`;
  }, [registeredCount, statsStatus]);

  return { countText, statsStatus };
};

const StatsBlock = ({ countText, statsStatus }) => (
  <div className="text-left lg:text-right">
    {statsStatus === 'loading' ? (
      <div className="h-7 w-60 animate-pulse rounded bg-sky-200/70 lg:ml-auto" />
    ) : (
      <p className={`text-lg font-black sm:text-xl ${statsStatus === 'error' ? 'text-rose-600' : 'text-sky-700'}`}>
        {countText}
      </p>
    )}
    {statsStatus === 'error' && (
      <p className="mt-1 text-xs font-semibold text-slate-600">
        Live stats are unavailable. Please refresh after a moment.
      </p>
    )}
  </div>
);

const AboutTechnothlon = () => (
  <section className="rounded-2xl bg-white/70 p-5 shadow-xl shadow-sky-200/35 backdrop-blur">
    <div className="text-sm font-bold leading-7 text-slate-950">
      <p className="text-xs uppercase tracking-[0.22em] text-sky-700">
        Know the platform
      </p>
      <h2 className="mt-3 text-3xl font-black text-sky-900">About Technothlon</h2>
      <button
        type="button"
        onClick={() => window.open('https://technothlon.techniche.org.in/', '_blank', 'noopener,noreferrer')}
        className="mt-2 text-left text-sm font-bold text-sky-800 underline underline-offset-4"
      >
        Register for Technothlon 2026 →
      </button>
      <p className="mt-4">
        Technothlon is the International School Championship organized by the student
        fraternity of IIT Guwahati under Techniche. It is built for school students who
        enjoy solving unusual, logic-heavy problems rather than memorizing standard facts.
      </p>
      <p className="mt-3">
        The contest tests mental aptitude, analytical thinking, observation, teamwork,
        and the ability to approach a problem from multiple directions. Students compete
        with peers from across India and get exposure to a national-level academic culture.
      </p>
      <p className="mt-3">
        Mega Contest acts as an entry point for students to experience the Technothlon
        style of questions, discover preparation resources, and move towards the main
        Technothlon 2026 registration journey.
      </p>
    </div>
  </section>
);

const RegisterCta = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6 text-center shadow-xl shadow-sky-300/25 backdrop-blur">
      <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-sky-300/25 blur-2xl" />
      <div className="absolute bottom-6 right-10 h-24 w-24 rounded-full bg-blue-300/20 blur-2xl" />
      <p className="relative mb-2 text-xs font-black uppercase tracking-[0.28em] text-sky-700">
        Dream Beyond Earth
      </p>
      <h2 className="relative text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
        Win Your Way to an
        <span className="block bg-gradient-to-r from-sky-700 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
          ISRO Trip
        </span>
      </h2>
      <p className="relative mt-2 text-sm font-semibold text-slate-600">
        Register for Mega Contest and compete for exciting rewards.
      </p>
      <button
        type="button"
        onClick={() => navigate('/contest/login')}
        className="relative mt-6 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 px-10 py-4 text-base font-black uppercase tracking-widest text-white shadow-xl shadow-blue-400/25 transition hover:-translate-y-1 hover:from-sky-500 hover:to-blue-600"
      >
        Register Now
      </button>
      <button
        type="button"
        onClick={() => navigate('/contest/login')}
        className="relative mt-3 block w-full text-sm font-black text-sky-700 underline underline-offset-4"
      >
        Individual Participation →
      </button>
    </section>
  );
};

const InstructionsSection = () => {
  const instructions = [
    'Teams of 2 members. Solo participation allowed.',
    'Verify registration details before starting.',
    'Complete in one sitting. No pause/resume.',
    'No external help, AI tools, or assistance.',
    "Auto-saved every 30 seconds. Don't refresh.",
    'Stable internet recommended.',
    'Unanswered questions marked zero.',
    'Results in 7 working days.',
    'Tampering leads to disqualification.',
    'Organizing committee decision is final.',
  ];

  return (
    <section className="rounded-2xl bg-white/70 p-5 shadow-xl shadow-sky-200/35 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.22em] text-sky-700">
        Before you begin
      </p>
      <h2 className="mt-2 text-2xl font-black text-sky-900">
        📋 Instructions for the Contest
      </h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {instructions.map((instruction, index) => (
          <div
            key={instruction}
            className="rounded-xl bg-sky-50/90 px-4 py-3 text-sm font-bold leading-6 text-slate-900 shadow-sm shadow-sky-100"
          >
            <span className="mr-2 font-black text-sky-700">{index + 1}.</span>
            {instruction}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs italic text-slate-600">
        * Instructions subject to change.
      </p>
    </section>
  );
};

const PageShell = ({ children, headerRight }) => (
  <div className="min-h-screen bg-sky-50 text-slate-950">
    <main className="relative overflow-hidden px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.24),transparent_36%),linear-gradient(135deg,#f8fbff_0%,#e0f2fe_48%,#bfdbfe_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,116,144,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.055)_1px,transparent_1px)] bg-[size:55px_55px]" />

      <section className="relative mx-auto w-full max-w-7xl rounded-3xl bg-white/38 p-4 shadow-2xl shadow-sky-300/35 backdrop-blur-xl sm:p-6 lg:p-8">
        <header className="grid gap-4 pb-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <h1 className="text-4xl font-black uppercase tracking-[0.18em] text-slate-950 sm:text-6xl lg:text-7xl">
            Mega Contest
          </h1>
          <div className="grid gap-3 lg:min-w-[20rem]">{headerRight}</div>
        </header>

        {children}
      </section>
    </main>
    <Footer />
  </div>
);

export const BeforeRegistration = ({ countText, statsStatus }) => (
  <PageShell headerRight={<StatsBlock countText={countText} statsStatus={statsStatus} />}>
    <div className="grid gap-5">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.66fr)]">
        <PrizesSection />
        <aside className="grid gap-5">
          <CountdownTimer />
          <RegisterCta />
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.66fr)]">
        <AboutTechnothlon />
        <ResourcesGrid />
      </section>
    </div>
  </PageShell>
);

export const AfterRegistration = ({ countText, statsStatus }) => (
  <PageShell
    headerRight={
      <>
        <ProfileDropdown />
        <StatsBlock countText={countText} statsStatus={statsStatus} />
      </>
    }
  >
    <div className="grid gap-5">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.66fr)]">
        <InstructionsSection />
        <aside className="grid gap-5">
          <CountdownTimer />
          <ParticipateButton
            contestStartTime={CONTEST_START_TIME}
            contestEndTime={CONTEST_END_TIME}
          />
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.66fr)]">
        <AboutTechnothlon />
        <ResourcesGrid />
      </section>
    </div>
  </PageShell>
);

const MegaContest = ({ registrationState }) => {
  const { isAuthenticated } = useAuthContext();
  const { countText, statsStatus } = useContestStats();

  if (registrationState === 'beforeRegistration') {
    return <BeforeRegistration countText={countText} statsStatus={statsStatus} />;
  }

  return isAuthenticated ? (
    <AfterRegistration countText={countText} statsStatus={statsStatus} />
  ) : (
    <BeforeRegistration countText={countText} statsStatus={statsStatus} />
  );
};

export default MegaContest;
