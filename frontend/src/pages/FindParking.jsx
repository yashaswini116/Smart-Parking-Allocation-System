import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getNearbyLots, getAllLots } from '../services/api.js';

export default function FindParking() {
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [locError, setLocError] = useState('');
  const [userPos, setUserPos] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setUserPos({ lat, lng });
          try {
            const data = await getNearbyLots(lat, lng, 20);
            setLots(data);
          } catch { const data = await getAllLots(); setLots(data); }
          setLoading(false);
        },
        async () => {
          setLocError('Location access denied. Showing all lots.');
          const data = await getAllLots(); setLots(data); setLoading(false);
        }
      );
    } else {
      getAllLots().then(d => { setLots(d); setLoading(false); });
    }
  }, []);

  useEffect(() => {
    if (!loading && !mapInstance.current && typeof window !== 'undefined') {
      import('leaflet').then(L => {
        if (mapInstance.current) return;
        const map = L.default.map(mapRef.current, { center: userPos ? [userPos.lat, userPos.lng] : [12.9716, 77.5946], zoom: 13, zoomControl: true });
        L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 19
        }).addTo(map);

        if (userPos) {
          L.default.circleMarker([userPos.lat, userPos.lng], { radius: 10, fillColor:'#3b82f6', color:'#fff', weight:2, fillOpacity:0.9 })
            .addTo(map).bindPopup('<b>📍 You are here</b>');
        }
        lots.forEach(lot => {
          const color = lot.totalAvailable > 10 ? '#10b981' : lot.totalAvailable > 0 ? '#f59e0b' : '#f43f5e';
          const marker = L.default.circleMarker([lot.latitude, lot.longitude], { radius:14, fillColor: color, color:'#fff', weight:2, fillOpacity:0.85 }).addTo(map);
          marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:180px"><b>${lot.name}</b><br/><small>${lot.address}</small><br/><br/>🏍️ Bike: ${lot.bikeAvailable} &nbsp; 🚗 Car: ${lot.carAvailable} &nbsp; ⚡ EV: ${lot.evAvailable}<br/><br/><a href="/book/${lot.id}" style="color:#3b82f6;font-weight:600;">📅 Book Now →</a></div>`);
        });
        mapInstance.current = map;
        setMapLoaded(true);
      });
    }
  }, [loading, lots, userPos]);

  const filtered = filter === 'ALL' ? lots : lots.filter(l => {
    if (filter === 'BIKE') return l.bikeAvailable > 0;
    if (filter === 'CAR') return l.carAvailable > 0;
    if (filter === 'EV') return l.evAvailable > 0;
    return true;
  });

  return (
    <div className="page">
      <Navbar />
      <div style={{ display:'flex', height:'calc(100vh - 64px)' }}>
        {/* Sidebar List */}
        <div style={{ width:'400px', flexShrink:0, overflowY:'auto', borderRight:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
          <div style={{ padding:'20px', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--bg-base)', zIndex:10 }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'12px' }}>
              <span className="live-dot" style={{ marginRight:'8px' }} />
              {lots.length} Parking Lots Found
            </h2>
            {locError && <div className="alert alert-warning" style={{ marginBottom:'12px' }}>{locError}</div>}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {['ALL','BIKE','CAR','EV'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
                  {f === 'BIKE' ? '🏍️' : f === 'CAR' ? '🚗' : f === 'EV' ? '⚡' : '🔍'} {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? <div className="loading-spinner" /> : (
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {filtered.map(lot => {
                const hasSlots = lot.totalAvailable > 0;
                return (
                  <div key={lot.id} className="card p-4" style={{ cursor:'pointer', borderColor: hasSlots ? 'rgba(59,130,246,0.2)' : 'rgba(244,63,94,0.2)' }}
                    onClick={() => navigate(`/book/${lot.id}`)}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                      <div>
                        <div style={{ fontWeight:'700', fontSize:'15px', marginBottom:'3px' }}>{lot.name}</div>
                        <div style={{ color:'var(--text-secondary)', fontSize:'12px' }}>📍 {lot.address}</div>
                      </div>
                      {lot.distanceKm !== undefined && (
                        <span className="distance-badge">{lot.distanceKm} km</span>
                      )}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'12px' }}>
                      {[
                        { icon:'🏍️', count: lot.bikeAvailable, label:'Bikes', rate: lot.bikeHourlyRate },
                        { icon:'🚗', count: lot.carAvailable, label:'Cars', rate: lot.carHourlyRate },
                        { icon:'⚡', count: lot.evAvailable, label:'EV', rate: lot.evHourlyRate },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign:'center', padding:'8px', borderRadius:'8px', background:'rgba(255,255,255,0.03)' }}>
                          <div style={{ fontSize:'16px' }}>{s.icon}</div>
                          <div style={{ fontWeight:'800', fontSize:'18px', color: s.count > 0 ? 'var(--emerald)' : 'var(--rose)' }}>{s.count}</div>
                          <div style={{ fontSize:'10px', color:'var(--text-muted)' }}>₹{s.rate}/hr</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>⏰ {lot.openHours}</span>
                      <span className={`badge ${hasSlots ? 'badge-available' : 'badge-occupied'}`}>
                        {hasSlots ? `${lot.totalAvailable} Available` : 'Full'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'var(--text-secondary)' }}>
                  <div style={{ fontSize:'40px', marginBottom:'12px' }}>😔</div>
                  <p>No lots match your filter.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex:1, position:'relative' }}>
          <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
          {!mapLoaded && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(8,12,24,0.8)', flexDirection:'column', gap:'12px' }}>
              <div className="loading-spinner" />
              <span style={{ color:'var(--text-secondary)', fontSize:'14px' }}>Loading map...</span>
            </div>
          )}
          <div style={{ position:'absolute', bottom:'24px', right:'24px', display:'flex', flexDirection:'column', gap:'8px', zIndex:1000 }}>
            {[{ color:'#10b981', label:'Available (10+)' }, { color:'#f59e0b', label:'Limited (<10)' }, { color:'#f43f5e', label:'Full' }].map(l => (
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(8,12,24,0.9)', padding:'6px 12px', borderRadius:'20px', border:'1px solid var(--border)', fontSize:'12px' }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background: l.color, display:'inline-block' }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
