import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getAdminMonitor } from '../services/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getAdminMonitor().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  if (loading || !data) return <><Navbar /><div className="loading-spinner" /></>;

  const occupancyRate = data.totalSlots > 0
    ? Math.round((data.totalSlots - data.totalAvailable) / data.totalSlots * 100) : 0;

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding:'32px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'4px' }}>📊 Admin Dashboard</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'14px' }}>
              <span className="live-dot" style={{ marginRight:'6px' }} /> Live data · Auto-refreshes every 5s
            </p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/monitor')}>🔍 Monitor</button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/lots')}>🏢 Manage Lots</button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid-4 mb-6">
          {[
            { icon:'🏢', label:'Total Lots', value: data.lots?.length || 0, color:'var(--primary)', bg:'rgba(59,130,246,0.1)' },
            { icon:'🅿️', label:'Total Slots', value: data.totalSlots || 0, color:'var(--cyan)', bg:'rgba(6,182,212,0.1)' },
            { icon:'✅', label:'Available', value: data.totalAvailable || 0, color:'var(--emerald)', bg:'rgba(16,185,129,0.1)' },
            { icon:'🚗', label:'Active Sessions', value: data.globalActive || 0, color:'var(--amber)', bg:'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Occupancy Gauge */}
        <div className="card p-6 mb-6">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'700' }}>🔥 Global Occupancy Rate</h3>
            <span style={{ fontSize:'28px', fontWeight:'900', color: occupancyRate > 80 ? 'var(--rose)' : occupancyRate > 50 ? 'var(--amber)' : 'var(--emerald)' }}>
              {occupancyRate}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{
              width:`${occupancyRate}%`,
              background: occupancyRate > 80 ? 'linear-gradient(90deg, var(--amber), var(--rose))' : 'linear-gradient(90deg, var(--primary), var(--emerald))'
            }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--text-secondary)', marginTop:'8px' }}>
            <span>0% Empty</span><span>50% Half-full</span><span>100% Full</span>
          </div>
        </div>

        <div className="grid-2" style={{ gap:'24px' }}>
          {/* Per-Lot Stats */}
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'14px' }}>🏢 Parking Lots Status</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {(data.lots || []).map(lot => {
                const rate = lot.occupancyRate || 0;
                return (
                  <div key={lot.lotId} className="card p-4" style={{ cursor:'pointer' }} onClick={() => navigate('/admin/monitor')}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                      <div>
                        <div style={{ fontWeight:'700', fontSize:'14px' }}>{lot.lotName}</div>
                        <div style={{ color:'var(--text-secondary)', fontSize:'12px' }}>{lot.address}</div>
                      </div>
                      <span style={{ fontSize:'16px', fontWeight:'800', color: rate > 80 ? 'var(--rose)' : rate > 50 ? 'var(--amber)' : 'var(--emerald)' }}>{rate}%</span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom:'10px' }}>
                      <div className="progress-fill" style={{ width:`${rate}%`, background: rate > 80 ? 'var(--rose)' : rate > 50 ? 'var(--amber)' : 'var(--emerald)' }} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', fontSize:'12px' }}>
                      {[
                        { label:'Available', value: lot.available, color:'var(--emerald)' },
                        { label:'Occupied', value: lot.occupied, color:'var(--rose)' },
                        { label:'Reserved', value: lot.reserved, color:'var(--amber)' },
                        { label:'Exited', value: lot.exited, color:'var(--purple)' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign:'center', padding:'6px', borderRadius:'6px', background:'rgba(255,255,255,0.03)' }}>
                          <div style={{ fontWeight:'700', color: s.color }}>{s.value}</div>
                          <div style={{ color:'var(--text-muted)', fontSize:'10px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'14px' }}>⚡ Recent Activity</h3>
            <div className="card" style={{ overflow:'hidden' }}>
              {(data.recentActivity || []).length === 0 ? (
                <div style={{ padding:'32px', textAlign:'center', color:'var(--text-secondary)' }}>No activity yet.</div>
              ) : (data.recentActivity || []).map((a, i) => (
                <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:'600', fontSize:'14px' }}>{a.vehicleNumber || '—'}</div>
                    <div style={{ color:'var(--text-secondary)', fontSize:'12px' }}>{a.lotName} · {a.vehicleType}</div>
                  </div>
                  <span className={`badge badge-${a.status?.toLowerCase()}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
