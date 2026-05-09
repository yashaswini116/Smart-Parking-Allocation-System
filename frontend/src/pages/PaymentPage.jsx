import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getBookingById, recordExit, processPayment } from '../services/api.js';

const METHODS = [
  { key:'CARD', icon:'💳', label:'Credit / Debit Card' },
  { key:'UPI', icon:'📱', label:'UPI Payment' },
  { key:'WALLET', icon:'👛', label:'Digital Wallet' },
  { key:'CASH', icon:'💵', label:'Pay at Counter' },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('parkUser') || '{}');

  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('CARD');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('details'); // details | processing | done

  useEffect(() => {
    getBookingById(bookingId)
      .then(b => { setBooking(b); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    setPaying(true); setStep('processing');
    // If ACTIVE booking, record exit first to get final fee
    try {
      let finalBooking = booking;
      if (booking.status === 'ACTIVE') {
        const exitRes = await recordExit(bookingId);
        finalBooking = exitRes.booking;
        setBooking(finalBooking);
      }
      await new Promise(r => setTimeout(r, 2500)); // Simulate processing animation
      const payRes = await processPayment({
        bookingId, userId: user.id, method,
        cardNumber: cardNum, upiId
      });
      setResult(payRes);
      setStep('done');
    } catch (e) { setStep('details'); setPaying(false); }
  };

  if (loading) return <><Navbar /><div className="loading-spinner" /></>;

  const amount = booking?.amount || 0;
  const duration = booking?.durationMinutes || 0;

  if (step === 'processing') return (
    <div className="page">
      <Navbar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 64px)', flexDirection:'column', gap:'24px' }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:100, height:100, borderRadius:'50%', border:'4px solid var(--border)', borderTopColor:'var(--primary)', animation:'spin 1s linear infinite' }} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>💳</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <h2 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>Processing Payment</h2>
          <p style={{ color:'var(--text-secondary)' }}>Securing your transaction via {method}...</p>
        </div>
        <div style={{ width:300, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg, var(--primary), var(--cyan))', borderRadius:3, animation:'shimmer 1.5s ease infinite', backgroundSize:'200% 100%' }} />
        </div>
      </div>
    </div>
  );

  if (step === 'done' && result) return (
    <div className="page">
      <Navbar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 64px)' }}>
        <div className="card p-8" style={{ maxWidth:'480px', width:'100%', textAlign:'center', border:'1px solid rgba(16,185,129,0.4)', margin:'24px' }}>
          <div style={{ fontSize:'72px', marginBottom:'16px', animation:'float 2s ease-in-out infinite' }}>
            {result.success ? '🎉' : '❌'}
          </div>
          <h2 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'8px', color: result.success ? 'var(--emerald)' : 'var(--rose)' }}>
            {result.success ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          {result.success && (
            <>
              <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'var(--radius-md)', padding:'20px', margin:'20px 0', textAlign:'left' }}>
                {[
                  ['Transaction ID', result.transactionId],
                  ['Payment ID', result.paymentId],
                  ['Amount Paid', `₹${Number(result.amount).toFixed(2)}`],
                  ['Method', result.method],
                  ['Booking ID', result.bookingId],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:'14px' }}>
                    <span style={{ color:'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight:'600', color: k === 'Amount Paid' ? 'var(--emerald)' : 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:'13px', marginBottom:'24px' }}>
                Thank you for using SmartPark! Your parking session has been recorded.
              </p>
            </>
          )}
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>🏠 Go Home</button>
            <button className="btn btn-secondary" onClick={() => navigate('/history')}>📋 View History</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding:'32px 24px', maxWidth:'800px' }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom:'20px' }} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'24px' }}>💳 Complete Payment</h1>

        <div className="grid-2" style={{ gap:'24px', alignItems:'start' }}>
          {/* Payment Methods */}
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'14px' }}>Payment Method</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
              {METHODS.map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)}
                  style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderRadius:'var(--radius-md)', border:`2px solid ${method === m.key ? 'var(--primary)' : 'var(--border)'}`, background: method === m.key ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)', cursor:'pointer', transition:'all 0.2s', color:'var(--text-primary)', fontFamily:'var(--font)', width:'100%', textAlign:'left' }}>
                  <span style={{ fontSize:'24px' }}>{m.icon}</span>
                  <span style={{ fontWeight:'600', fontSize:'14px' }}>{m.label}</span>
                  {method === m.key && <span style={{ marginLeft:'auto', color:'var(--primary)', fontSize:'18px' }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Method-specific fields */}
            {method === 'CARD' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim())} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input className="form-input" placeholder="MM/YY" maxLength={5} value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" type="password" placeholder="•••" maxLength={3} value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            {method === 'UPI' && (
              <div className="form-group">
                <label className="form-label">UPI ID</label>
                <input className="form-input" placeholder="yourname@upi" value={upiId}
                  onChange={e => setUpiId(e.target.value)} />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
              <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'18px' }}>Order Summary</h3>
              {[
                ['Lot', booking?.lotName],
                ['Slot', booking?.slotNumber],
                ['Vehicle', booking?.vehicleNumber],
                ['Type', booking?.vehicleType],
                ['Duration', duration > 0 ? `${Math.ceil(duration/60)} hr(s)` : 'In Progress'],
                ['Status', booking?.status],
              ].map(([k,v]) => v && (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:'14px' }}>
                  <span style={{ color:'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontWeight:'600' }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0 0', fontSize:'20px', fontWeight:'800' }}>
                <span>Total</span>
                <span className="gradient-text">₹{Number(amount).toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'16px', padding:'16px' }}
              onClick={handlePay} disabled={paying}>
              {paying ? '⏳ Processing...' : `🔐 Pay ₹${Number(amount).toFixed(2)}`}
            </button>
            <p style={{ textAlign:'center', fontSize:'12px', color:'var(--text-muted)', marginTop:'10px' }}>
              🔒 Secured with 256-bit encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
