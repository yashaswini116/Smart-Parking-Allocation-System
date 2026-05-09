import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { getAllLots, createLot, updateLot, deleteLot } from '../services/api.js';

const EMPTY_FORM = { name:'', address:'', city:'Bengaluru', latitude:'', longitude:'', totalBikeSlots:10, totalCarSlots:20, totalEvSlots:5, bikeHourlyRate:20, carHourlyRate:50, evHourlyRate:55, openHours:'24/7', contactPhone:'', description:'' };

export default function AdminLotManager() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLot, setEditLot] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => { setLoading(true); getAllLots().then(d => { setLots(d); setLoading(false); }); };
  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditLot(null); setShowForm(true); setError(''); };
  const openEdit = (lot) => {
    setForm({ ...lot, latitude: lot.latitude?.toString(), longitude: lot.longitude?.toString() });
    setEditLot(lot.id); setShowForm(true); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), totalBikeSlots: Number(form.totalBikeSlots), totalCarSlots: Number(form.totalCarSlots), totalEvSlots: Number(form.totalEvSlots), bikeHourlyRate: Number(form.bikeHourlyRate), carHourlyRate: Number(form.carHourlyRate), evHourlyRate: Number(form.evHourlyRate) };
      if (editLot) { await updateLot(editLot, payload); setSuccess('Lot updated!'); }
      else { await createLot(payload); setSuccess('Lot created!'); }
      setShowForm(false); load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); setTimeout(() => setSuccess(''), 3000); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lot? This cannot be undone.')) return;
    await deleteLot(id); load();
  };

  const F = ({ label, name, type='text', placeholder='', min, step }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} placeholder={placeholder} min={min} step={step} required
        value={form[name] || ''} onChange={e => setForm(f => ({...f, [name]: e.target.value}))} />
    </div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding:'32px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'4px' }}>🏢 Manage Parking Lots</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'14px' }}>{lots.length} lots configured</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add New Lot</button>
        </div>

        {success && <div className="alert alert-success">{success}</div>}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card p-6 mb-6" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
              <h3 style={{ fontSize:'18px', fontWeight:'700' }}>{editLot ? '✏️ Edit Lot' : '➕ Add New Lot'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'20px' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid-2" style={{ gap:'16px', marginBottom:'16px' }}>
                <F label="Lot Name *" name="name" placeholder="e.g. Central Parking Hub" />
                <F label="City *" name="city" placeholder="Bengaluru" />
                <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                  <label className="form-label">Address *</label>
                  <input className="form-input" required placeholder="Full address" value={form.address || ''}
                    onChange={e => setForm(f => ({...f, address: e.target.value}))} />
                </div>
                <F label="Latitude *" name="latitude" type="number" placeholder="12.9716" step="any" />
                <F label="Longitude *" name="longitude" type="number" placeholder="77.5946" step="any" />
                <F label="Bike Slots" name="totalBikeSlots" type="number" min="0" />
                <F label="Car Slots" name="totalCarSlots" type="number" min="0" />
                <F label="EV Slots" name="totalEvSlots" type="number" min="0" />
                <F label="Bike Rate (₹/hr)" name="bikeHourlyRate" type="number" min="0" />
                <F label="Car Rate (₹/hr)" name="carHourlyRate" type="number" min="0" />
                <F label="EV Rate (₹/hr)" name="evHourlyRate" type="number" min="0" />
                <F label="Open Hours" name="openHours" placeholder="24/7" />
                <F label="Contact Phone" name="contactPhone" placeholder="080-12345678" />
                <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Brief description..." value={form.description || ''}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                </div>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ display:'flex', gap:'10px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Lot'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Lots Table */}
        {loading ? <div className="loading-spinner" /> : (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lot Name</th>
                    <th>City</th>
                    <th>🏍️ Bike</th>
                    <th>🚗 Car</th>
                    <th>⚡ EV</th>
                    <th>Available</th>
                    <th>Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map(lot => (
                    <tr key={lot.id}>
                      <td>
                        <div style={{ fontWeight:'700' }}>{lot.name}</div>
                        <div style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{lot.address}</div>
                      </td>
                      <td style={{ color:'var(--text-secondary)' }}>{lot.city}</td>
                      <td><span style={{ color:'var(--primary)', fontWeight:'700' }}>{lot.bikeAvailable}/{lot.totalBikeSlots}</span></td>
                      <td><span style={{ color:'var(--emerald)', fontWeight:'700' }}>{lot.carAvailable}/{lot.totalCarSlots}</span></td>
                      <td><span style={{ color:'var(--purple)', fontWeight:'700' }}>{lot.evAvailable}/{lot.totalEvSlots}</span></td>
                      <td>
                        <span className={`badge ${lot.totalAvailable > 0 ? 'badge-available' : 'badge-occupied'}`}>
                          {lot.totalAvailable} free
                        </span>
                      </td>
                      <td style={{ color:'var(--text-secondary)', fontSize:'13px' }}>{lot.openHours}</td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(lot)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lot.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
