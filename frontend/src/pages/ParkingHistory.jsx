import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getUserBookings, recordEntry, recordExit, cancelBooking } from '../services/api.js';

const STATUS_COLORS = { ACTIVE:'var(--cyan)', CONFIRMED:'var(--primary)', COMPLETED:'var(--emerald)', CANCELLED:'var(--text-muted)', PENDING:'var(--amber)', WAITING:'var(--amber)' };
const VEHICLE_ICONS = { BIKE:'🏍️', CAR:'🚗', EV:'⚡' };

export default function ParkingHistory() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('parkUser') || '{}');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState('');

  const load = () => {
    setLoading(true);
    getUserBookings(user.id).then(b => { setBookings(b); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
  const totalSpent = bookings.filter(b => b.status === 'COMPLETED' && b.paymentDone).reduce((s,b) => s + (b.amount||0), 0);

  const doAction = async (fn, id) => {
    setActionLoading(id);
    try { await fn(id); load(); }
    catch (e) { alert(e.message); }
    finally { setActionLoading(''); }
  };

  if (loading) return <><Navbar /><div className="loading-spinner" /></>;

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding:'32px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px', marginBottom:'28px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'4px' }}>📋 Parking History</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'14px' }}>{bookings.length} total bookings · ₹{totalSpent.toFixed(0)} spent</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/find-parking')}>+ Book New Slot</button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px' }}>
          {['ALL','CONFIRMED','ACTIVE','COMPLETED','CANCELLED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid-4 mb-6">
          {[
            { label:'Total', value: bookings.length, color:'var(--primary)', filter:'ALL' },
            { label:'Active', value: bookings.filter(b=>b.status==='ACTIVE').length, color:'var(--cyan)', filter:'ACTIVE' },
            { label:'Completed', value: bookings.filter(b=>b.status==='COMPLETED').length, color:'var(--emerald)', filter:'COMPLETED' },
            { label:'Cancelled', value: bookings.filter(b=>b.status==='CANCELLED').length, color:'var(--rose)', filter:'CANCELLED' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ cursor:'pointer' }} onClick={() => setFilter(s.filter)}>
              <div className="stat-value" style={{ color: s.color, fontSize:'28px' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-8" style={{ textAlign:'center', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>📭</div>
            <p>No bookings found.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop:'12px' }} onClick={() => navigate('/find-parking')}>Find Parking Now</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {filtered.map(b => (
              <div key={b.id} className="card p-5" style={{ borderLeft:`3px solid ${STATUS_COLORS[b.status] || 'var(--border)'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                      <span style={{ fontSize:'22px' }}>{VEHICLE_ICONS[b.vehicleType] || '🚘'}</span>
                      <div>
                        <div style={{ fontWeight:'700', fontSize:'15px' }}>{b.lotName}</div>
                        <div style={{ color:'var(--text-secondary)', fontSize:'13px' }}>Slot {b.slotNumber} · {b.vehicleNumber}</div>
                      </div>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                    </div>
                    <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', fontSize:'13px', color:'var(--text-secondary)' }}>
                      <span>📅 Booked: {b.bookingTime ? new Date(b.bookingTime).toLocaleString() : '—'}</span>
                      {b.entryTime && <span>🚦 Entry: {new Date(b.entryTime).toLocaleTimeString()}</span>}
                      {b.exitTime && <span>🏁 Exit: {new Date(b.exitTime).toLocaleTimeString()}</span>}
                      {b.durationMinutes > 0 && <span>⏱️ {Math.ceil(b.durationMinutes/60)}h {b.durationMinutes%60}m</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    {b.amount && <div style={{ fontSize:'20px', fontWeight:'800', color:'var(--amber)' }}>₹{Number(b.amount).toFixed(0)}</div>}
                    {b.paymentDone && <div style={{ fontSize:'11px', color:'var(--emerald)' }}>✓ Paid</div>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:'8px', marginTop:'14px', flexWrap:'wrap' }}>
                  {b.status === 'CONFIRMED' && !b.entryTime && (
                    <button className="btn btn-success btn-sm" disabled={actionLoading === b.id}
                      onClick={() => doAction(recordEntry, b.id)}>
                      {actionLoading === b.id ? '⏳' : '🚦 Mark Entry'}
                    </button>
                  )}
                  {b.status === 'ACTIVE' && (
                    <button className="btn btn-secondary btn-sm" disabled={actionLoading === b.id}
                      onClick={() => doAction(recordExit, b.id)}>
                      {actionLoading === b.id ? '⏳' : '🏁 Mark Exit'}
                    </button>
                  )}
                  {(b.status === 'CONFIRMED' || b.status === 'ACTIVE') && !b.paymentDone && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/payment/${b.id}`)}>💳 Pay</button>
                  )}
                  {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                    <button className="btn btn-danger btn-sm" disabled={actionLoading === b.id}
                      onClick={() => doAction(cancelBooking, b.id)}>
                      {actionLoading === b.id ? '⏳' : '✗ Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
