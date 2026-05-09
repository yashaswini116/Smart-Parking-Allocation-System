import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import { getAdminMonitor, getAllLots, getSlotsByLot, updateSlotStatus } from '../services/api.js';

const STATUS_ICONS = { AVAILABLE:'✅', OCCUPIED:'🔴', RESERVED:'🟡', MAINTENANCE:'🔧' };

export default function AdminMonitor() {
  const [data, setData] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const load = useCallback(() => {
    Promise.all([getAdminMonitor(), getAllLots()])
      .then(([d, l]) => { setData(d); setLots(l); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  useEffect(() => {
    if (selectedLot) {
      setSlotsLoading(true);
      getSlotsByLot(selectedLot).then(s => { setSlots(s); setSlotsLoading(false); });
    }
  }, [selectedLot]);

  const handleSlotStatusChange = async (slotId, status) => {
    await updateSlotStatus(slotId, status);
    const updated = await getSlotsByLot(selectedLot);
    setSlots(updated);
  };

  if (loading || !data) return <><Navbar /><div className="loading-spinner" /></>;

  const lotData = data.lots || [];
  const currentLotSlots = slots;
  const bikeSlots = currentLotSlots.filter(s => s.vehicleType === 'BIKE');
  const carSlots = currentLotSlots.filter(s => s.vehicleType === 'CAR');
  const evSlots = currentLotSlots.filter(s => s.vehicleType === 'EV');

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding:'32px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'4px' }}>🔍 Real-Time Monitor</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'14px' }}>
              <span className="live-dot" style={{ marginRight:'6px' }} /> Auto-refreshing every 5s
            </p>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid-4 mb-6">
          {[
            { icon:'🚗', label:'Active Sessions', value: data.globalActive, color:'var(--cyan)' },
            { icon:'✅', label:'Available Slots', value: data.totalAvailable, color:'var(--emerald)' },
            { icon:'🏁', label:'Completed Today', value: data.globalCompleted, color:'var(--purple)' },
            { icon:'⏳', label:'Pending', value: data.globalPending, color:'var(--amber)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Per-lot Monitor Grid */}
        <div className="grid-2 mb-6" style={{ gap:'20px' }}>
          {lotData.map(lot => (
            <div key={lot.lotId} className="card p-5" style={{ cursor:'pointer', borderColor: selectedLot === lot.lotId ? 'var(--primary)' : 'var(--border)' }}
              onClick={() => setSelectedLot(selectedLot === lot.lotId ? null : lot.lotId)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <div>
                  <div style={{ fontWeight:'700', fontSize:'15px' }}>{lot.lotName}</div>
                  <div style={{ color:'var(--text-secondary)', fontSize:'12px' }}>Capacity: {lot.totalCapacity}</div>
                </div>
                <span style={{ fontSize:'22px', fontWeight:'900', color: lot.occupancyRate > 80 ? 'var(--rose)' : lot.occupancyRate > 50 ? 'var(--amber)' : 'var(--emerald)' }}>
                  {lot.occupancyRate}%
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'8px', marginBottom:'14px' }}>
                {[
                  { label:'Available', val: lot.available, icon:'✅', color:'var(--emerald)' },
                  { label:'Occupied', val: lot.occupied, icon:'🔴', color:'var(--rose)' },
                  { label:'Reserved', val: lot.reserved, icon:'🟡', color:'var(--amber)' },
                  { label:'Entered', val: lot.entered, icon:'🚗', color:'var(--cyan)' },
                  { label:'Exited', val: lot.exited, icon:'🏁', color:'var(--purple)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:'center', padding:'8px 4px', borderRadius:'8px', background:'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize:'16px' }}>{s.icon}</div>
                    <div style={{ fontWeight:'800', fontSize:'16px', color: s.color }}>{s.val}</div>
                    <div style={{ fontSize:'9px', color:'var(--text-muted)', marginTop:'2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${lot.occupancyRate}%`, background: lot.occupancyRate > 80 ? 'var(--rose)' : 'var(--primary)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Slot Detail View */}
        {selectedLot && (
          <div className="card p-6" style={{ borderColor:'rgba(59,130,246,0.3)' }}>
            <h3 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'20px' }}>
              🗺️ Slot Map — {lots.find(l => l.id === selectedLot)?.name}
            </h3>
            {slotsLoading ? <div className="loading-spinner" style={{ margin:'20px auto' }} /> : (
              <>
                {[{ label:'🏍️ Bike Slots', data: bikeSlots, type:'BIKE' },
                  { label:'🚗 Car Slots', data: carSlots, type:'CAR' },
                  { label:'⚡ EV Slots', data: evSlots, type:'EV' }].map(group => (
                  <div key={group.type} style={{ marginBottom:'24px' }}>
                    <h4 style={{ fontSize:'14px', fontWeight:'700', marginBottom:'10px', color:'var(--text-secondary)' }}>
                      {group.label} ({group.data.filter(s=>s.status==='AVAILABLE').length}/{group.data.length} free)
                    </h4>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {group.data.map(slot => (
                        <div key={slot.id} style={{
                          padding:'10px 12px', borderRadius:'var(--radius-md)', minWidth:'80px', textAlign:'center',
                          border:`2px solid ${slot.status==='AVAILABLE'?'rgba(16,185,129,0.5)':slot.status==='OCCUPIED'?'rgba(244,63,94,0.5)':slot.status==='RESERVED'?'rgba(245,158,11,0.5)':'var(--border)'}`,
                          background: slot.status==='AVAILABLE'?'rgba(16,185,129,0.08)':slot.status==='OCCUPIED'?'rgba(244,63,94,0.08)':slot.status==='RESERVED'?'rgba(245,158,11,0.08)':'var(--bg-card)',
                          position:'relative'
                        }}>
                          <div style={{ fontSize:'16px' }}>{STATUS_ICONS[slot.status]}</div>
                          <div style={{ fontSize:'12px', fontWeight:'700', margin:'4px 0' }}>{slot.slotNumber}</div>
                          {slot.supportsCharging && <div style={{ fontSize:'10px', color:'var(--purple)' }}>⚡ Charging</div>}
                          <select onChange={e => handleSlotStatusChange(slot.id, e.target.value)} value={slot.status}
                            style={{ fontSize:'10px', background:'transparent', color:'var(--text-muted)', border:'none', cursor:'pointer', marginTop:'4px', width:'100%', textAlign:'center' }}>
                            {['AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE'].map(s => (
                              <option key={s} value={s} style={{ background:'#1e293b' }}>{s}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
