'use client';
import Navbar from '@/components/ui/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';

const AIRPORT_NAMES: Record<string, string> = {
  BOM: 'Mumbai',
  DEL: 'Delhi',
  BLR: 'Bengaluru',
  HYD: 'Hyderabad',
  MAA: 'Chennai',
  CCU: 'Kolkata',
  SXR: 'Srinagar',
};

interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: string;
  base_price: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const { searchQuery, setSelectedFlight } = useFlightStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  if (!searchQuery.origin || !searchQuery.destination) {
    router.push('/search');
    return;
  }

  // Fetch all flights on this route, filter by date on client
  // This avoids UTC/IST timezone mismatch between Vercel and Supabase
  fetch(`/api/flights?origin=${searchQuery.origin}&destination=${searchQuery.destination}`)
    .then((r) => r.json())
    .then((data) => {
      const allFlights: Flight[] = data.flights || [];

      // If a date was selected, filter to flights on that calendar date
      // using the user's LOCAL timezone — not UTC
      if (searchQuery.date) {
        const filtered = allFlights.filter((f) => {
          // Convert the UTC timestamp to user's local date string
          const flightLocalDate = new Date(f.departs_at)
            .toLocaleDateString('en-CA'); // gives YYYY-MM-DD in local timezone
          return flightLocalDate === searchQuery.date;
        });
        setFlights(filtered);
      } else {
        setFlights(allFlights);
      }

      setLoading(false);
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      setError('Failed to load flights. Please try again.');
      setLoading(false);
    });
}, [searchQuery, router]);

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return iso;
    }
  }

  function calcDuration(dep: string, arr: string) {
    try {
      const diff = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return `${h}h ${m}m`;
    } catch {
      return '';
    }
  }

  function handleSelect(flight: Flight) {
    setSelectedFlight(flight, 'economy');
    router.push('/seats');
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    border: '1.5px solid #DDE5EE',
    padding: '1.25rem 1.5rem',
    marginBottom: '14px',
    boxShadow: '0 1px 6px rgba(10,79,140,0.07)',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FA' }}>

      <Navbar active="results" />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', margin: 0 }}>
              {AIRPORT_NAMES[searchQuery.origin] || searchQuery.origin}
              {' → '}
              {AIRPORT_NAMES[searchQuery.destination] || searchQuery.destination}
            </h2>
            <p style={{ color: '#5A6A78', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {loading ? 'Searching...' : `${flights.length} flight${flights.length !== 1 ? 's' : ''} found`}
              {searchQuery.date ? ` · ${searchQuery.date}` : ''}
            </p>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.7rem',
            color: '#1A7A4A',
            fontWeight: 600,
            background: '#E6F7ED',
            padding: '3px 8px',
            borderRadius: '20px',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#1A7A4A',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }} />
            Live Availability
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#5A6A78' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✈</div>
            <p>Searching for flights...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FDF0F0',
            border: '1px solid #f5c6cb',
            color: '#B83232',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && flights.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#5A6A78' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈</div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#0F1923', marginBottom: '0.5rem' }}>
              No flights found
            </p>
            <p style={{ fontSize: '0.88rem' }}>Try a different date or route</p>
            <button
              onClick={() => router.push('/search')}
              style={{
                marginTop: '1rem',
                background: '#0A4F8C',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Search Again
            </button>
          </div>
        )}

        {!loading && flights.map((f) => (
          <div key={f.id} style={cardStyle}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#E8F2FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>
                  ✈
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0A4F8C' }}>
                    {f.flight_no}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5A6A78' }}>
                    SkyWay Airlines · {f.aircraft_type}
                  </div>
                </div>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 600,
                background: f.status === 'delayed' ? '#FEF8E7' : '#E6F7ED',
                color: f.status === 'delayed' ? '#9A6800' : '#1A7A4A',
              }}>
                {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 500, fontFamily: 'Georgia, serif' }}>
                  {formatTime(f.departs_at)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#5A6A78', fontWeight: 600 }}>{f.origin}</div>
                <div style={{ fontSize: '0.72rem', color: '#8A9BAA' }}>
                  {AIRPORT_NAMES[f.origin]}
                </div>
              </div>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#5A6A78' }}>
                  {calcDuration(f.departs_at, f.arrives_at)}
                </div>
                <div style={{ height: '1.5px', background: '#DDE5EE', margin: '0.25rem 0', position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    top: '-9px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.9rem',
                  }}>
                    ✈
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8A9BAA' }}>Non-stop</div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 500, fontFamily: 'Georgia, serif' }}>
                  {formatTime(f.arrives_at)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#5A6A78', fontWeight: 600 }}>{f.destination}</div>
                <div style={{ fontSize: '0.72rem', color: '#8A9BAA' }}>
                  {AIRPORT_NAMES[f.destination]}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid #DDE5EE',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { cls: 'Economy', fee: 0 },
                  { cls: 'Business', fee: 1200 },
                  { cls: 'First', fee: 2500 },
                ].map((c) => (
                  <div key={c.cls} style={{
                    border: '1.5px solid #DDE5EE',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#5A6A78' }}>{c.cls}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      ₹{(f.base_price + c.fee).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect(f)}
                style={{
                  background: '#0A4F8C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 22px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                }}
              >
                Select Seats →
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
