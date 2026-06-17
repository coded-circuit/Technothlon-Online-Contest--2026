import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getLocalUser = () => ({
  name: localStorage.getItem('userName') || '',
  mobile: localStorage.getItem('userPhone') || localStorage.getItem('mobile') || '',
  email: localStorage.getItem('userEmail') || '',
});

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'MC';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(getLocalUser);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me');
        if (!response.ok) throw new Error('Unable to load profile');
        const data = await response.json();
        if (!isMounted) return;
        setUser({
          name: data.name || getLocalUser().name,
          mobile: data.mobile || data.phone || getLocalUser().mobile,
          email: data.email || getLocalUser().email,
        });
        setStatus('success');
      } catch (error) {
        if (!isMounted) return;
        const fallbackUser = getLocalUser();
        setUser(fallbackUser);
        setStatus(fallbackUser.name || fallbackUser.email || fallbackUser.mobile ? 'success' : 'error');
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const initials = useMemo(() => getInitials(user.name || user.email), [user.name, user.email]);

  const handleLogout = () => {
    [
      'sessionId',
      'sessionToken',
      'token',
      'userName',
      'userPhone',
      'userEmail',
      'userRoll',
      'userSchool',
      'userCity',
      'usertype',
    ].forEach((key) => localStorage.removeItem(key));
    navigate('/contest/login', { replace: true });
  };

  return (
    <div ref={wrapperRef} className="relative flex justify-end">
      {status === 'loading' ? (
        <div className="h-12 w-12 animate-pulse rounded-full bg-sky-200/80" />
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-sky-200/50 transition hover:-translate-y-0.5 hover:bg-sky-800"
          aria-label="Open profile menu"
        >
          {initials}
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl bg-white/95 p-4 text-left shadow-2xl shadow-sky-200/60 ring-1 ring-sky-100 backdrop-blur">
          {status === 'error' ? (
            <div>
              <p className="text-sm font-black text-rose-600">Profile unavailable</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                We could not load your profile details right now.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-black text-sky-950">{user.name || 'Mega Contest User'}</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                <span aria-hidden="true">📱</span> {user.mobile || 'Mobile unavailable'}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                <span aria-hidden="true">✉️</span> {user.email || 'Email unavailable'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-black uppercase tracking-wider text-rose-600 transition hover:bg-rose-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
