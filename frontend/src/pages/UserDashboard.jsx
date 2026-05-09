import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getAllLots, getUserBookings } from '../services/api.js';

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('parkUser') || '{}');
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllLots().catch(() => []),
      getUserBookings(user.id).catch(() => [])
    ]).then(([l, b]) => { setLots(l); setBookings(b); setLoading(false); });
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'CONFIRMED');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalSpent = completedBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const totalAvailable = lots.reduce((s, l) => s + (l.totalAvailable || 0), 0);

  const getStatusColor = (s) => ({ ACTIVE:'var(--cyan)', CONFIRMED:'var(--primary)', COMPLETED:'var(--emerald)', CANCELLED:'var(--text-muted)', PENDING:'var(--amber)', WAITING:'var(--amber)' }[s] || 'var(--text-secondary)');

  if (loading) return <><Navbar /><div className="loading-spinner" /></>;

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding:'32px 24px' }}>
        {/* Welcome Banner */}
        <div className="card p-6 mb-6" style={{ background:'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))', border:'1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h1 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'4px' }}>
                Welcome back, {user.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color:'var(--text-secondary)', fontSize:'14px' }}>
                {activeBookings.length > 0 ? `You have ${activeBookings.length} active booking(s)` : 'Ready to find your parking spot?'}
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/find-parking')}>
              📍 Find Parking
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-6">
          {[
            { icon:'🏢', label:'Nearby Lots', value: lots.length, color:'var(--primary)', bg:'rgba(59,130,246,0.1)' },
            { icon:'🅿️', label:'Available Slots', value: totalAvailable, color:'var(--emerald)', bg:'rgba(16,185,129,0.1)' },
            { icon:'📋', label:'My Bookings', value: bookings.length, color:'var(--cyan)', bg:'rgba(6,182,212,0.1)' },
            { icon:'💰', label:'Total Spent', value: `₹${totalSpent.toFixed(0)}`, color:'var(--amber)', bg:'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ ['--accent']: s.color }}>
              <div className="stat-icon" style={{ background: s.bg, fontSize:'24px' }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap:'24px' }}>
          {/* Active Bookings */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h2 style={{ fontSize:'18px', fontWeight:'700' }}>Active Bookings</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>View All →</button>
            </div>
            {activeBookings.length === 0 ? (
              <div className="card p-6" style={{ textAlign:'center', color:'var(--text-secondary)' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>🅿️</div>
                <p>No active bookings.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop:'12px' }} onClick={() => navigate('/find-parking')}>Book Now</button>
              </div>
            ) : activeBookings.map(b => (
              <div key={b.id} className="card p-4 mb-3">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                  <div>
                    <div style={{ fontWeight:'700', fontSize:'15px' }}>{b.lotName}</div>
                    <div style={{ color:'var(--text-secondary)', fontSize:'13px' }}>Slot {b.slotNumber} · {b.vehicleNumber}</div>
                  </div>
                  <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'12px' }}>
                  {b.status === 'CONFIRMED' && (
                    <button className="btn btn-success btn-sm" onClick={() => navigate(`/payment/${b.id}`)}>💳 Pay Now</button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>View Details</button>
                </div>
              </div>
            ))}
          </div>

          {/* Nearby Lots Quick View */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h2 style={{ fontSize:'18px', fontWeight:'700' }}>Parking Lots</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/find-parking')}>View Map →</button>
            </div>
            {lots.slice(0,3).map(lot => (
              <div key={lot.id} className="card p-4 mb-3" style={{ cursor:'pointer' }} onClick={() => navigate(`/book/${lot.id}`)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div style={{ fontWeight:'700', fontSize:'15px' }}>{lot.name}</div>
                  <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{lot.openHours}</span>
                </div>
                <div style={{ color:'var(--text-secondary)', fontSize:'13px', marginBottom:'12px' }}>📍 {lot.address}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                  {[
                    { icon:'🏍️', count: lot.bikeAvailable, label:'Bikes', color:'var(--primary)' },
                    { icon:'🚗', count: lot.carAvailable, label:'Cars', color:'var(--emerald)' },
                    { icon:'⚡', count: lot.evAvailable, label:'EV', color:'var(--purple)' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign:'center', padding:'8px', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize:'18px' }}>{s.icon}</div>
                      <div style={{ fontWeight:'800', fontSize:'18px', color: s.count > 0 ? s.color : 'var(--rose)' }}>{s.count}</div>
                      <div style={{ fontSize:'10px', color:'var(--text-secondary)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
