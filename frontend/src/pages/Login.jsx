import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
                navigate('/');
            } else {
                await register(email, password);
                setError('');
                setIsLogin(true);
                setEmail('');
                setPassword('');
                // Show success as a brief notice
                setError('✅ Registered! Please sign in.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
            <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 80px rgba(99,102,241,.18)', border: '1px solid #e2e8f0', background: '#fff' }}>

                {/* ── Left panel ── */}
                <div className="hero-gradient" style={{ padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(139,92,246,.2)' }} />
                    <div style={{ position: 'absolute', bottom: -60, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(6,182,212,.15)' }} />

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)' }}>S</div>
                        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: '#fff', fontSize: '1.25rem' }}>ShopEasy</span>
                    </div>

                    {/* Copy */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '3rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>🛍️</div>
                        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: 14, lineHeight: 1.2 }}>
                            Your AI-Powered<br />Shopping Hub
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 28 }}>
                            Browse 37+ premium products, get AI recommendations, and checkout in seconds.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[['✨', 'AI Shopping Assistant'], ['🚚', 'Free shipping over $99'], ['↩️', '30-day free returns'], ['🔒', '100% secure checkout']].map(([icon, text]) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.85)', fontSize: '.85rem' }}>
                                    <span>{icon}</span> {text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.75rem', position: 'relative', zIndex: 1 }}>© 2025 ShopEasy Inc.</p>
                </div>

                {/* ── Right panel – form ── */}
                <div style={{ padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 36 }}>
                        {['Sign In', 'Register'].map((tab, i) => (
                            <button key={tab} onClick={() => { setIsLogin(i === 0); setError(''); }}
                                style={{
                                    flex: 1, padding: '9px', borderRadius: 9,
                                    border: 'none', cursor: 'pointer',
                                    fontWeight: 700, fontSize: '.875rem',
                                    transition: 'all .2s',
                                    background: isLogin === (i === 0) ? '#fff' : 'transparent',
                                    color: isLogin === (i === 0) ? '#6366f1' : '#94a3b8',
                                    boxShadow: isLogin === (i === 0) ? '0 1px 6px rgba(0,0,0,.08)' : 'none',
                                }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#0f172a', marginBottom: 6 }}>
                        {isLogin ? 'Welcome back 👋' : 'Create account'}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '.875rem', marginBottom: 28 }}>
                        {isLogin ? 'Sign in to access your orders and AI assistant.' : 'Join ShopEasy and start shopping smarter.'}
                    </p>

                    {error && (
                        <div style={{
                            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
                            background: error.startsWith('✅') ? '#d1fae5' : '#fef2f2',
                            color: error.startsWith('✅') ? '#065f46' : '#dc2626',
                            border: `1px solid ${error.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
                            fontSize: '.875rem', fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 18 }}>
                            <label className="input-label">Email address</label>
                            <input className="input-field" type="email" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label className="input-label">Password</label>
                                {isLogin && <span style={{ fontSize: '.78rem', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Forgot?</span>}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input className="input-field" type={showPwd ? 'text' : 'password'}
                                    placeholder={isLogin ? 'Your password' : 'Min 6 characters'}
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                    style={{ paddingRight: 46 }} />
                                <button type="button" onClick={() => setShowPwd(s => !s)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem' }}>
                                    {showPwd ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
                            style={{ width: '100%', justifyContent: 'center' }}>
                            {loading ? (
                                <><div className="animate-spin" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Please wait…</>
                            ) : (isLogin ? '🚀 Sign In' : '✨ Create Account')}
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
                        {[['🔒', 'Secure & encrypted'], ['🚫', 'No spam ever'], ['📦', '37+ products']].map(([icon, label]) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: '#94a3b8', fontWeight: 500 }}>
                                <span>{icon}</span> {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
