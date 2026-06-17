import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'ME';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

const getLocalUser = () => {
  const name = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail') || '';
  const rollNumber = localStorage.getItem('userRoll') || '';
  const sessionId = localStorage.getItem('sessionId') || localStorage.getItem('sessionToken');

  if (!name && !email && !sessionId) {
    return null;
  }

  return {
    name: name || 'Mega Contest Participant',
    email,
    rollNumber,
    isRegisteredForTechnothlon: Boolean(rollNumber),
  };
};

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const localUser = getLocalUser();
    const token = localStorage.getItem('token') || localStorage.getItem('sessionToken') || localStorage.getItem('sessionId');

    if (!localUser && !token) {
      return;
    }

    setUser(localUser);

    const fetchUser = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Profile unavailable');
        }

        const data = await response.json();
        setUser({
          name: data.name || localUser?.name || 'Mega Contest Participant',
          email: data.email || localUser?.email || '',
          rollNumber: data.rollNumber || localUser?.rollNumber || '',
          isRegisteredForTechnothlon: Boolean(data.isRegisteredForTechnothlon || data.rollNumber || localUser?.rollNumber),
        });
      } catch (error) {
        setUser(localUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = useMemo(() => getInitials(user?.name), [user]);

  const handleLogout = () => {
    ['token', 'sessionToken', 'sessionId', 'userName', 'userEmail', 'userRoll', 'userPhone', 'userSchool', 'usertype'].forEach((key) => {
      localStorage.removeItem(key);
    });
    navigate('/contest/login');
  };

  if (!user && !loading) {
    return null;
  }

  return (
    <div ref={wrapperRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white shadow-lg shadow-sky-300/50 transition hover:-translate-y-0.5"
        aria-label="Open profile menu"
      >
        {loading ? '...' : initials}
      </button>

      <div
        className={`absolute right-0 top-12 z-20 w-72 origin-top-right rounded-2xl bg-white p-4 shadow-2xl shadow-slate-400/35 transition ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <p className="font-black text-slate-950">{user?.name}</p>
        <p className="mt-1 text-sm text-slate-500">{user?.email || 'Email not available'}</p>

        {user?.isRegisteredForTechnothlon ? (
          <p className="mt-4 rounded-xl bg-sky-50 px-3 py-2 text-sm font-black text-sky-800">
            Roll No: {user.rollNumber}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => window.open('https://technothlon.techniche.org.in/', '_blank', 'noopener,noreferrer')}
            className="mt-4 w-full rounded-xl border border-sky-500 px-3 py-2 text-sm font-black text-sky-700 transition hover:bg-sky-50"
          >
            Register for Technothlon 2026 →
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-xl border border-red-300 px-3 py-2 text-sm font-black text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
