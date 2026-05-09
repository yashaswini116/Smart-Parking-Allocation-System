import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api.js';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // 'login' | 'register'
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', role:'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await loginUser({ email: form.email, password: form.password });
      } else {
        user = await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
        user = await loginUser({ email: form.email, password: form.password });
      }
      localStorage.setItem('parkUser', JSON.stringify(user));
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const demoLogin = async (email, password) => {
    setLoading(true); setError('');
    try {
      const user = await loginUser({ email, password });
      localStorage.setItem('parkUser', JSON.stringify(user));
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ background: 'var(--bg-base)', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Background gradient blobs */}
      <div style={{ position:'fixed', top:'-20%', left:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-20%', right:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div style={{ width:'100%', maxWidth:'480px' }}>
          {/* Logo */}
          <div className="text-center animate-fade-up" style={{ marginBottom:'40px' }}>
            <div style={{ fontSize:'64px', marginBottom:'16px' }} className="animate-float">🅿️</div>
            <h1 style={{ fontSize:'42px', fontWeight:'900', letterSpacing:'-1px', marginBottom:'8px' }}>
              <span className="gradient-text">Smart</span>Park
            </h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'16px' }}>Intelligent Parking Allocation System</p>
          </div>

          {!mode ? (
            <div className="animate-fade-up card p-8" style={{ textAlign:'center' }}>
              <h2 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>Welcome Back</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'32px' }}>Find and book parking spaces in seconds</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <button className="btn btn-primary btn-lg" style={{ justifyContent:'center' }} onClick={() => setMode('login')}>
                  🔐 Sign In
                </button>
                <button className="btn btn-secondary btn-lg" style={{ justifyContent:'center' }} onClick={() => setMode('register')}>
                  ✨ Create Account
                </button>
              </div>
              <div style={{ margin:'24px 0', borderTop:'1px solid var(--border)', paddingTop:'24px' }}>
                <p style={{ color:'var(--text-muted)', fontSize:'12px', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px' }}>Quick Demo Access</p>
                <div style={{ display:'flex', gap:'10px' }}>
                  <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center', fontSize:'13px' }}
                    onClick={() => demoLogin('yasha@gmail.com','user123')}>
                    👤 User Demo
                  </button>
                  <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center', fontSize:'13px' }}
                    onClick={() => demoLogin('admin@smartpark.com','admin123')}>
                    🛡️ Admin Demo
                  </button>
                </div>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              {loading && <div className="loading-spinner" style={{ margin:'16px auto', width:'28px', height:'28px' }} />}
            </div>
          ) : (
            <div className="animate-fade-up card p-8">
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
                <button onClick={() => setMode(null)} style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'20px' }}>←</button>
                <h2 style={{ fontSize:'20px', fontWeight:'700' }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
              </div>
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {mode === 'register' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" placeholder="John Doe" required
                        value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" placeholder="9876543210"
                        value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@email.com" required
                    value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" required
                    value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent:'center', marginTop:'8px' }}>
                  {loading ? '⏳ Processing...' : (mode === 'login' ? '🔐 Sign In' : '✨ Create Account')}
                </button>
              </form>
              <p style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'var(--text-secondary)' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <span style={{ color:'var(--primary)', cursor:'pointer', fontWeight:'600' }}
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </span>
              </p>
            </div>
          )}

          {/* Feature pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center', marginTop:'32px' }}>
            {['📍 Live Location','⚡ Real-time Slots','🅿️ Instant Book','💳 Secure Pay','📊 Analytics'].map(f => (
              <span key={f} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-full)', padding:'6px 14px', fontSize:'12px', color:'var(--text-secondary)' }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
