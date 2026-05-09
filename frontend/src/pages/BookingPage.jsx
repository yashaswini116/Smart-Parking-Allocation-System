import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getLotById, getSlotsByLot, createBooking } from '../services/api.js';

const VEHICLE_TYPES = [
  { key:'BIKE', icon:'🏍️', label:'Bike', color:'var(--primary)', bg:'rgba(59,130,246,0.1)' },
  { key:'CAR', icon:'🚗', label:'Car', color:'var(--emerald)', bg:'rgba(16,185,129,0.1)' },
  { key:'EV', icon:'⚡', label:'Electric Vehicle', color:'var(--purple)', bg:'rgba(139,92,246,0.1)' },
];

export default function BookingPage() {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('parkUser') || '{}');

  const [lot, setLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [vehicleType, setVehicleType] = useState('CAR');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState(user.name || '');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([getLotById(lotId), getSlotsByLot(lotId)])
      .then(([l, s]) => { setLot(l); setSlots(s); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [lotId]);

  const filteredSlots = slots.filter(s => s.vehicleType === vehicleType);
  const availableCount = filteredSlots.filter(s => s.status === 'AVAILABLE').length;
  const vt = VEHICLE_TYPES.find(v => v.key === vehicleType);

  const getRate = () => {
    if (!lot) return 0;
    return vehicleType === 'BIKE' ? lot.bikeHourlyRate : vehicleType === 'CAR' ? lot.carHourlyRate : lot.evHourlyRate;
  };

  const handleBook = async () => {
    if (!vehicleNumber.trim()) { setError('Please enter your vehicle number'); return; }
    setError(''); setBooking(true);
    try {
      const result = await createBooking({ lotId: Number(lotId), userId: user.id, vehicleType, vehicleNumber: vehicleNumber.toUpperCase(), ownerName });
      setSuccess(result);
      loadData();
    } catch (e) { setError(e.message); }
    finally { setBooking(false); }
  };

  const getSlotStyle = (slot) => {
    if (slot.status === 'AVAILABLE') return slot.vehicleType === 'EV' ? 'ev available' : 'available';
    if (slot.status === 'OCCUPIED') return 'occupied';
    if (slot.status === 'RESERVED') return 'reserved';
    return '';
  };

  if (loading) return <><Navbar /><div className="loading-spinner" /></>;

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding:'32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:'24px' }}>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom:'16px' }} onClick={() => navigate('/find-parking')}>← Back</button>
          <h1 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'4px' }}>{lot?.name}</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'14px' }}>📍 {lot?.address} · ⏰ {lot?.openHours}</p>
        </div>

        {success ? (
          <div className="card p-8" style={{ textAlign:'center', maxWidth:'480px', margin:'0 auto', border:'1px solid rgba(16,185,129,0.3)' }}>
            <div style={{ fontSize:'64px', marginBottom:'16px' }}>
              {success.status === 'WAITING' ? '⏳' : '✅'}
            </div>
            <h2 style={{ fontSize:'22px', fontWeight:'800', marginBottom:'8px', color: success.status === 'WAITING' ? 'var(--amber)' : 'var(--emerald)' }}>
              {success.status === 'WAITING' ? 'Added to Waiting Queue!' : 'Booking Confirmed!'}
            </h2>
            {success.status === 'WAITING' ? (
              <p style={{ color:'var(--text-secondary)', marginBottom:'24px' }}>
                {success.message}<br />Booking ID: <strong>{success.bookingId}</strong>
              </p>
            ) : (
              <>
                <p style={{ color:'var(--text-secondary)', marginBottom:'8px' }}>
                  Booking ID: <strong style={{ color:'var(--text-primary)' }}>{success.bookingId}</strong>
                </p>
                <p style={{ color:'var(--text-secondary)', marginBottom:'8px' }}>
                  Slot: <strong style={{ color:'var(--primary)' }}>{success.slotNumber}</strong>
                </p>
                <p style={{ color:'var(--text-secondary)', marginBottom:'24px' }}>
                  Estimated Fee: <strong style={{ color:'var(--amber)' }}>₹{success.estimatedFee}</strong>
                </p>
                <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'24px' }}>
                  Strategy Used: {success.strategyUsed}
                </p>
              </>
            )}
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              {success.status !== 'WAITING' && (
                <button className="btn btn-primary" onClick={() => navigate(`/payment/${success.bookingId}`)}>💳 Pay Now</button>
              )}
              <button className="btn btn-secondary" onClick={() => navigate('/history')}>📋 View History</button>
              <button className="btn btn-secondary" onClick={() => setSuccess(null)}>Book Another</button>
            </div>
          </div>
        ) : (
          <div className="grid-2" style={{ gap:'28px', alignItems:'start' }}>
            {/* Slot Grid */}
            <div>
              {/* Vehicle Type Selector */}
              <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'14px' }}>Select Vehicle Type</h3>
              <div style={{ display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' }}>
                {VEHICLE_TYPES.map(v => {
                  const cnt = slots.filter(s => s.vehicleType === v.key && s.status === 'AVAILABLE').length;
                  return (
                    <button key={v.key} onClick={() => setVehicleType(v.key)}
                      style={{ flex:1, padding:'14px 12px', borderRadius:'var(--radius-md)', border:`2px solid ${vehicleType === v.key ? v.color : 'var(--border)'}`, background: vehicleType === v.key ? v.bg : 'var(--bg-card)', cursor:'pointer', transition:'all 0.2s', color:'var(--text-primary)', fontFamily:'var(--font)' }}>
                      <div style={{ fontSize:'24px', marginBottom:'4px' }}>{v.icon}</div>
                      <div style={{ fontWeight:'700', fontSize:'13px' }}>{v.label}</div>
                      <div style={{ fontSize:'11px', color: cnt > 0 ? 'var(--emerald)' : 'var(--rose)', marginTop:'3px' }}>{cnt} slots free</div>
                    </button>
                  );
                })}
              </div>

              {/* Slot Grid Visual */}
              <div style={{ marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ fontSize:'16px', fontWeight:'700' }}>{vt?.icon} {vt?.label} Slots</h3>
                <div style={{ display:'flex', gap:'8px', fontSize:'11px' }}>
                  {[{ c:'#10b981', l:'Available' }, { c:'#f43f5e', l:'Occupied' }, { c:'#f59e0b', l:'Reserved' }].map(i => (
                    <span key={i.l} style={{ display:'flex', alignItems:'center', gap:'4px', color:'var(--text-secondary)' }}>
                      <span style={{ width:8, height:8, borderRadius:'2px', background:i.c, display:'inline-block' }} />{i.l}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <div className="slot-grid">
                  {filteredSlots.map(slot => (
                    <div key={slot.id} className={`slot-cell ${getSlotStyle(slot)}`} title={`${slot.slotNumber} — ${slot.status}${slot.supportsCharging ? ' ⚡Charging' : ''}`}>
                      <span className="slot-icon">{vehicleType === 'BIKE' ? '🏍️' : vehicleType === 'CAR' ? '🚗' : '⚡'}</span>
                      <span>{slot.slotNumber}</span>
                    </div>
                  ))}
                </div>
                {filteredSlots.length === 0 && (
                  <p style={{ textAlign:'center', color:'var(--text-secondary)', padding:'24px' }}>No slots configured for this type.</p>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <div className="card p-6">
                <h3 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'20px' }}>📅 Book a Slot</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  <div style={{ padding:'14px', borderRadius:'var(--radius-md)', background: vt?.bg, border:`1px solid ${vt?.color}30` }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>Rate</span>
                      <span style={{ fontWeight:'700', color: vt?.color }}>₹{getRate()}/hour</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                      <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>Available</span>
                      <span style={{ fontWeight:'700', color: availableCount > 0 ? 'var(--emerald)' : 'var(--rose)' }}>{availableCount} slots</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehicle Number *</label>
                    <input className="form-input" placeholder="e.g. KA01AB1234" value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input className="form-input" placeholder="Your name" value={ownerName}
                      onChange={e => setOwnerName(e.target.value)} />
                  </div>

                  {availableCount === 0 && (
                    <div className="alert alert-warning">
                      ⏳ All {vt?.label} slots are occupied. You will be added to the waiting queue.
                    </div>
                  )}

                  {error && <div className="alert alert-error">{error}</div>}

                  <button className="btn btn-primary" style={{ justifyContent:'center' }}
                    onClick={handleBook} disabled={booking}>
                    {booking ? '⏳ Booking...' : (availableCount > 0 ? `✅ Confirm Booking` : `⏳ Join Waiting Queue`)}
                  </button>
                </div>
              </div>

              {/* Lot Info */}
              <div className="card p-5" style={{ marginTop:'16px' }}>
                <h4 style={{ fontSize:'14px', fontWeight:'700', marginBottom:'12px' }}>📋 Lot Details</h4>
                {[
                  ['Total Capacity', lot?.totalCapacity],
                  ['Bike Slots', lot?.totalBikeSlots],
                  ['Car Slots', lot?.totalCarSlots],
                  ['EV Slots', lot?.totalEvSlots],
                  ['Open Hours', lot?.openHours],
                  ['Contact', lot?.contactPhone || 'N/A'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'13px' }}>
                    <span style={{ color:'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight:'600' }}>{v}</span>
                  </div>
                ))}
                {lot?.description && <p style={{ fontSize:'12px', color:'var(--text-secondary)', marginTop:'12px' }}>{lot.description}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
