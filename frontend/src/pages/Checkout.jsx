import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const STEPS = ['Shipping', 'Payment', 'Review'];

const Field = ({ label, name, values, onChange, placeholder, type = 'text', error }) => (
    <div>
        <label className="input-label">{label}</label>
        <input className={`input-field${error ? ' error' : ''}`} type={type} name={name}
            placeholder={placeholder} value={values[name]}
            onChange={e => onChange(name, e.target.value)} />
        {error && <p style={{ color: '#ef4444', fontSize: '.75rem', marginTop: 4 }}>{error}</p>}
    </div>
);

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const [form, setForm] = useState({
        fullName: '', address: '', city: '', state: '', zip: '',
        cardNumber: '', expiry: '', cvc: '', nameOnCard: '',
    });
    const [errors, setErrors] = useState({});

    const shipping = total > 99 ? 0 : total > 0 ? 8.99 : 0;
    const grandTotal = total + shipping;

    const setField = (name, value) => {
        setForm(f => ({ ...f, [name]: value }));
        setErrors(e => { const ne = { ...e }; delete ne[name]; return ne; });
    };

    const validateStep = () => {
        const e = {};
        if (step === 0) {
            if (!form.fullName.trim()) e.fullName = 'Required';
            if (!form.address.trim()) e.address = 'Required';
            if (!form.city.trim()) e.city = 'Required';
            if (!form.zip.trim()) e.zip = 'Required';
        }
        if (step === 1) {
            if (!/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(form.cardNumber.replace(/\s/g, '')))
                e.cardNumber = 'Enter a valid 16-digit card number';
            if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'Format: MM/YY';
            if (!form.cvc.match(/^\d{3,4}$/)) e.cvc = 'Invalid CVC';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validateStep()) setStep(s => s + 1); };
    const back = () => { setStep(s => s - 1); setErrors({}); };

    const placeOrder = async () => {
        setLoading(true);
        setServerError('');
        try {
            const items = cart.map(item => ({ product_id: item.id, quantity: item.quantity || 1 }));
            await api.post('/orders/', { items });
            clearCart();
            navigate('/orders');
        } catch (err) {
            setServerError(err.response?.data?.detail || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#94a3b8', marginBottom: 16 }}>Your cart is empty.</p>
            <Link to="/" className="btn btn-primary">Back to Shop</Link>
        </div>
    );

    return (
        <div className="fade-in-up">
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.9rem', fontWeight: 800, marginBottom: 32, color: '#0f172a' }}>Checkout</h1>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, maxWidth: 420 }}>
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '.82rem', transition: 'all .3s',
                                background: i < step ? '#10b981' : i === step ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e2e8f0',
                                color: i <= step ? '#fff' : '#94a3b8',
                            }}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '.72rem', fontWeight: 600, color: i === step ? '#6366f1' : '#94a3b8' }}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className="step-line" style={{ background: i < step ? '#10b981' : '#e2e8f0', marginBottom: 22 }} />}
                    </React.Fragment>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
                {/* ── Form panel ── */}
                <div className="card" style={{ padding: '30px 28px' }}>
                    {step === 0 && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>📦 Shipping Details</h2>
                            <Field label="Full Name" name="fullName" values={form} onChange={setField} placeholder="John Doe" error={errors.fullName} />
                            <Field label="Street Address" name="address" values={form} onChange={setField} placeholder="123 Main St" error={errors.address} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Field label="City" name="city" values={form} onChange={setField} placeholder="New York" error={errors.city} />
                                <Field label="ZIP Code" name="zip" values={form} onChange={setField} placeholder="10001" error={errors.zip} />
                            </div>
                            <Field label="State / Country" name="state" values={form} onChange={setField} placeholder="NY, United States" />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>💳 Payment Details</h2>
                            <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 16, padding: '20px 22px', marginBottom: 6 }}>
                                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>Card Preview</p>
                                <p style={{ color: '#fff', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '.15em', marginBottom: 16 }}>
                                    {(form.cardNumber || '•••• •••• •••• ••••').replace(/(\d{4})(?=\d)/g, '$1 ')}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.8rem' }}>{form.nameOnCard || 'CARDHOLDER NAME'}</span>
                                    <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.8rem' }}>{form.expiry || 'MM/YY'}</span>
                                </div>
                            </div>
                            <Field label="Name on Card" name="nameOnCard" values={form} onChange={setField} placeholder="John Doe" />
                            <Field label="Card Number" name="cardNumber" values={form} onChange={setField} placeholder="1234 5678 9012 3456" error={errors.cardNumber} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Field label="Expiry (MM/YY)" name="expiry" values={form} onChange={setField} placeholder="08/27" error={errors.expiry} />
                                <Field label="CVC" name="cvc" values={form} onChange={setField} placeholder="123" error={errors.cvc} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="fade-in">
                            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: 20 }}>✅ Review Your Order</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 18px' }}>
                                    <p style={{ fontWeight: 700, marginBottom: 8, color: '#334155' }}>📦 Ship to</p>
                                    <p style={{ color: '#64748b', fontSize: '.875rem' }}>{form.fullName}</p>
                                    <p style={{ color: '#64748b', fontSize: '.875rem' }}>{form.address}, {form.city} {form.zip}</p>
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 18px' }}>
                                    <p style={{ fontWeight: 700, marginBottom: 8, color: '#334155' }}>💳 Payment</p>
                                    <p style={{ color: '#64748b', fontSize: '.875rem', fontFamily: 'monospace' }}>**** **** **** {form.cardNumber.slice(-4) || '****'}</p>
                                </div>
                            </div>
                            {serverError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: '.875rem', marginBottom: 20 }}>
                                    {serverError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
                        {step > 0 ? (
                            <button className="btn btn-outline" onClick={back}>← Back</button>
                        ) : (
                            <Link to="/cart" className="btn btn-outline">← Cart</Link>
                        )}
                        {step < 2 ? (
                            <button className="btn btn-primary" onClick={next}>Continue →</button>
                        ) : (
                            <button className="btn btn-primary btn-lg" onClick={placeOrder} disabled={loading}
                                style={{ minWidth: 160, justifyContent: 'center' }}>
                                {loading ? <><div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%' }} /> Placing…</> : '🎉 Place Order'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Order Summary ── */}
                <div className="card" style={{ padding: '22px 20px', position: 'sticky', top: 90 }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1rem', marginBottom: 18, color: '#0f172a' }}>Order Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: '#64748b' }}>
                                <span style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name} ×{item.quantity || 1}</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="divider" style={{ margin: '12px 0' }} />
                    {[['Subtotal', `$${total.toFixed(2)}`], ['Shipping', shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`]].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', color: '#475569', marginBottom: 8 }}>
                            <span>{label}</span><span style={{ fontWeight: 600 }}>{val}</span>
                        </div>
                    ))}
                    <div className="divider" style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800 }}>Total</span>
                        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#6366f1' }}>${grandTotal.toFixed(2)}</span>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '.72rem', color: '#94a3b8', marginTop: 16 }}>🔒 256-bit SSL encryption</p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
