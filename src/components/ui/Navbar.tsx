'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavUser {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Navbar({ active }: { active?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadUser();
    checkWelcomeToast();
  }, []);

  function loadUser() {
    try {
      const raw = localStorage.getItem('skyway_current_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }

  function checkWelcomeToast() {
    const name = sessionStorage.getItem('skyway_welcome');
    if (name) {
      sessionStorage.removeItem('skyway_welcome');
      triggerToast(`Welcome back, ${name}! 👋`);
    }
  }

  function triggerToast(msg: string) {
    setToast(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  }

  function getInitials(u: NavUser) {
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }

  function handleSignOut() {
    localStorage.removeItem('skyway_current_user');
    setUser(null);
    setShowSignOutModal(false);
    router.push('/search');
  }

  const navBtnStyle = {
    background: 'transparent',
    border: '1.5px solid rgba(255,255,255,0.32)',
    color: '#fff',
    padding: '6px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
  };

  return (
    <>
      {/* SIGN OUT MODAL */}
      {showSignOutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '380px', width: '100%', boxShadow: '0 16px 60px rgba(0,0,0,0.22)', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Sign Out</h3>
            <p style={{ color: '#5A6A78', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Are you sure you want to sign out?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setShowSignOutModal(false)} style={{ background: '#fff', border: '1.5px solid #0A4F8C', color: '#0A4F8C', borderRadius: '8px', padding: '9px 22px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={handleSignOut} style={{ background: '#B83232', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 22px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 400,
        background: '#1A7A4A', color: '#fff', padding: '12px 20px',
        borderRadius: '10px', fontSize: '0.88rem', fontFamily: 'sans-serif',
        fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        transform: showToast ? 'translateY(0)' : 'translateY(100px)',
        opacity: showToast ? 1 : 0,
        pointerEvents: 'none',
      }}>
        {toast}
      </div>

      {/* NAV */}
      <nav style={{ background: '#0A4F8C', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div onClick={() => router.push('/search')} style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '1.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✈ SkyWay
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/search')}
            style={{ ...navBtnStyle, background: active === 'search' ? 'rgba(255,255,255,0.2)' : 'transparent', borderColor: active === 'search' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.32)' }}
          >
            Search
          </button>
          <button
            onClick={() => router.push('/bookings')}
            style={{ ...navBtnStyle, background: active === 'bookings' ? 'rgba(255,255,255,0.2)' : 'transparent', borderColor: active === 'bookings' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.32)' }}
          >
            My Bookings
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#C8922A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: '#fff', cursor: 'default' }}
                title={`${user.firstName} ${user.lastName}`}>
                {getInitials(user)}
              </div>
              <button onClick={() => setShowSignOutModal(true)} style={{ ...navBtnStyle, fontSize: '0.78rem', padding: '5px 14px' }}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => router.push('/auth')} style={{ ...navBtnStyle }}>
              Sign In
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
