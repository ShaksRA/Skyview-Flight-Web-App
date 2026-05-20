'use client';
import Navbar from '@/components/ui/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';

export default function BookingPage() {
  const router = useRouter();
  const { selectedFlight, selectedSeat, searchQuery, resetBookingFlow } = useFlightStore();

  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('Indian');
  const [passport, setPassport] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!selectedFlight || !selectedSeat) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#5A6A78' }}>
          <p>No flight or seat selected.</p>
          <button onClick={() => router.push('/search')} style={{ marginTop: '1rem', background: '#0A4F8C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer' }}>
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  const total = selectedFlight.base_price + (selectedSeat.extra_fee || 0);

  function generatePNR() {
    return Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
  }

  async function handleConfirm() {
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);

    // Simulate booking confirmation (replace with real API call when auth is set up)
    await new Promise(r => setTimeout(r, 800));
    const pnr = generatePNR();

    // Store confirmation data in sessionStorage to show on confirmation page
    sessionStorage.setItem('skyway_confirmation', JSON.stringify({
      pnr,
      flight: selectedFlight,
      seat: selectedSeat,
      passenger: { full_name: fullName, nationality, dob },
      email,
      phone,
      total,
      date: searchQuery.date,
    }));

    resetBookingFlow();
    setLoading(false);
    router.push('/confirmation');
  }

  const inputStyle = {
    border: '1.5px solid #DDE5EE', borderRadius: '8px', padding: '10px 12px',
    fontSize: '0.92rem', outline: 'none', background: '#fff', width: '100%', fontFamily: 'inherit',
  };

  const labelStyle = {
    fontSize: '0.72rem', fontWeight: 600 as const, color: '#5A6A78',
    textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: '5px', display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FA' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #DDE5EE' }}>
          {['1. Flight', '2. Seat', '3. Details', '4. Confirm'].map((step, i) => (
            <div key={step} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, background: i === 2 ? '#0A4F8C' : i < 2 ? '#E8F2FC' : '#F4F7FA', color: i === 2 ? '#fff' : i < 2 ? '#0A4F8C' : '#8A9BAA', borderRight: i < 3 ? '1px solid #DDE5EE' : 'none' }}>
              {step}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #DDE5EE', padding: '1.5rem', boxShadow: '0 1px 6px rgba(10,79,140,0.07)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE5EE' }}>
              Passenger Details
            </h3>

            {error && (
              <div style={{ background: '#FDF0F0', border: '1px solid #f5c6cb', color: '#B83232', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Name (as on passport)</label>
                <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label style={labelStyle}>Nationality</label>
                <select style={inputStyle} value={nationality} onChange={e => setNationality(e.target.value)}>
                  {['Indian','American','British','Canadian','Australian','Other'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input style={inputStyle} type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Passport Number</label>
                <input style={inputStyle} value={passport} onChange={e => setPassport(e.target.value)} placeholder="AB1234567" />
              </div>
            </div>

            <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', margin: '1.5rem 0 1rem', paddingTop: '1rem', borderTop: '1px solid #DDE5EE' }}>
              Contact Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ marginTop: '1.5rem', background: loading ? '#ccc' : '#0A4F8C', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}
            >
              {loading ? 'Confirming...' : 'Confirm Booking →'}
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #DDE5EE', padding: '1.5rem', boxShadow: '0 1px 6px rgba(10,79,140,0.07)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE5EE' }}>
              Order Summary
            </h3>
            {[
              { label: 'Flight', val: selectedFlight.flight_no },
              { label: 'Route',  val: `${selectedFlight.origin} → ${selectedFlight.destination}` },
              { label: 'Date',   val: searchQuery.date },
              { label: 'Seat',   val: `${selectedSeat.seat_number} (${selectedSeat.class})` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DDE5EE', fontSize: '0.88rem' }}>
                <span style={{ color: '#5A6A78' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '1rem', borderTop: '2px solid #DDE5EE', marginTop: '4px' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, color: '#C8922A', fontSize: '1.1rem' }}>₹{total.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
