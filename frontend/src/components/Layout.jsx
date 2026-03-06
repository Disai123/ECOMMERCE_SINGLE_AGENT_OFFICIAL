import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); setUserMenuOpen(false); };
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/cart', label: 'Cart' },
        ...(user ? [{ path: '/orders', label: 'Orders' }] : []),
        ...(user?.is_admin ? [{ path: '/admin', label: 'Admin' }] : []),
    ];

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--clr-bg)' }}>

            {/* ── Announcement bar ── */}
            <div style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', padding: '9px 0' }}>
                <div className="ticker-wrap">
                    <div className="ticker-content" style={{ color: '#fff', fontSize: '.78rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                        {['✦ Free Shipping on Orders Above $99', '✦ AI Shopping Assistant Available', '✦ 30-Day Free Returns', '✦ 100% Secure Checkout', '✦ Free Shipping on Orders Above $99', '✦ AI Shopping Assistant Available', '✦ 30-Day Free Returns', '✦ 100% Secure Checkout'].join('   ·   ')}
                    </div>
                </div>
            </div>

            {/* ── Navbar ── */}
            <header className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(99,102,241,.12)', boxShadow: '0 1px 20px rgba(0,0,0,.06)' }}>
                <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{
                            width: 36, height: 36,
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 800, fontSize: '1rem',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            boxShadow: '0 4px 12px rgba(99,102,241,.35)'
                        }}>S</div>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-.5px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ShopEasy
                        </span>
                    </Link>

                    {/* Nav links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {navLinks.map(({ path, label }) => (
                            <Link key={path} to={path} style={{
                                padding: '7px 16px',
                                borderRadius: 10,
                                fontSize: '.875rem',
                                fontWeight: isActive(path) ? 600 : 500,
                                color: isActive(path) ? '#6366f1' : '#475569',
                                background: isActive(path) ? '#eef2ff' : 'transparent',
                                transition: 'all .18s ease',
                                textDecoration: 'none',
                                letterSpacing: '.01em',
                            }}
                                onMouseEnter={e => { if (!isActive(path)) { e.target.style.background = '#f1f5f9'; e.target.style.color = '#6366f1'; } }}
                                onMouseLeave={e => { if (!isActive(path)) { e.target.style.background = 'transparent'; e.target.style.color = '#475569'; } }}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: cart + user */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Cart */}
                        <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 12, background: '#f1f5f9', color: '#475569', transition: 'all .18s', textDecoration: 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -4, right: -4,
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: '#fff', fontSize: '.65rem', fontWeight: 800,
                                    width: 19, height: 19, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid #fff',
                                }}>
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User */}
                        {user ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setUserMenuOpen(o => !o)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '7px 14px', borderRadius: 12,
                                        background: '#f1f5f9', border: 'none', cursor: 'pointer',
                                        transition: 'all .18s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                                    onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.background = '#f1f5f9'; }}
                                >
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '.8rem', fontWeight: 700,
                                    }}>
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#334155' }}>
                                        {user.email?.split('@')[0]}
                                    </span>
                                    <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {userMenuOpen && (
                                    <div className="scale-in" style={{
                                        position: 'absolute', top: '110%', right: 0, minWidth: 180,
                                        background: '#fff', borderRadius: 14, boxShadow: '0 10px 40px rgba(0,0,0,.12)',
                                        border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 100,
                                    }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                            <p style={{ fontSize: '.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Signed in as</p>
                                            <p style={{ fontSize: '.85rem', fontWeight: 600, color: '#334155', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                                        </div>
                                        {[
                                            { path: '/orders', icon: '📦', label: 'My Orders' },
                                            ...(user.is_admin ? [{ path: '/admin', icon: '⚡', label: 'Admin Panel' }] : []),
                                        ].map(item => (
                                            <Link key={item.path} to={item.path}
                                                onClick={() => setUserMenuOpen(false)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: '.875rem', color: '#475569', transition: 'background .15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span>{item.icon}</span> {item.label}
                                            </Link>
                                        ))}
                                        <button onClick={handleLogout} style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 16px', fontSize: '.875rem', color: '#ef4444',
                                            background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #f1f5f9',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">
                                Sign In
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            {/* ── Main ── */}
            <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 24px' }}
                onClick={() => setUserMenuOpen(false)}>
                <Outlet />
            </main>

            {/* ── Footer ── */}
            <footer style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', color: '#fff', marginTop: 'auto' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 24px 28px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 40, marginBottom: 48 }}>
                        {/* Brand */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>S</div>
                                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.2rem' }}>ShopEasy</span>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '.875rem', lineHeight: 1.7 }}>The smartest AI-powered shopping experience. Find what you love, fast.</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                                {['🐦', '📸', '💼', '▶'].map((icon, i) => (
                                    <button key={i} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', fontSize: '.9rem', color: '#94a3b8', transition: 'all .18s' }}
                                        onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,.3)'; e.target.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,.08)'; e.target.style.color = '#94a3b8'; }}
                                    >{icon}</button>
                                ))}
                            </div>
                        </div>

                        {/* Shop */}
                        <div>
                            <p style={{ fontWeight: 700, marginBottom: 16, color: '#e2e8f0', fontSize: '.875rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Shop</p>
                            {['Electronics', 'Clothing', 'Home & Garden', 'Books', 'All Products'].map(item => (
                                <Link key={item} to="/" style={{ display: 'block', color: '#94a3b8', fontSize: '.875rem', marginBottom: 10, transition: 'color .15s', textDecoration: 'none' }}
                                    onMouseEnter={e => e.target.style.color = '#fff'}
                                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                >{item}</Link>
                            ))}
                        </div>

                        {/* Help */}
                        <div>
                            <p style={{ fontWeight: 700, marginBottom: 16, color: '#e2e8f0', fontSize: '.875rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Help</p>
                            {['FAQ', 'Shipping Policy', 'Return Policy', 'Contact Us', 'Track Order'].map(item => (
                                <span key={item} style={{ display: 'block', color: '#94a3b8', fontSize: '.875rem', marginBottom: 10, cursor: 'pointer', transition: 'color .15s' }}
                                    onMouseEnter={e => e.target.style.color = '#fff'}
                                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                >{item}</span>
                            ))}
                        </div>

                        {/* Newsletter */}
                        <div>
                            <p style={{ fontWeight: 700, marginBottom: 16, color: '#e2e8f0', fontSize: '.875rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Newsletter</p>
                            <p style={{ color: '#94a3b8', fontSize: '.875rem', marginBottom: 16, lineHeight: 1.6 }}>Get deals & new arrivals straight to your inbox.</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input type="email" placeholder="your@email.com" style={{
                                    flex: 1, padding: '9px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,.1)',
                                    background: 'rgba(255,255,255,.07)', color: '#fff', fontSize: '.85rem', outline: 'none',
                                }} />
                                <button style={{ padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
                                    Go
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                        <p style={{ color: '#64748b', fontSize: '.8rem' }}>© 2025 ShopEasy Inc. All rights reserved. Powered by AI.</p>
                        <div style={{ display: 'flex', gap: 20 }}>
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                                <span key={item} style={{ color: '#64748b', fontSize: '.8rem', cursor: 'pointer' }}
                                    onMouseEnter={e => e.target.style.color = '#94a3b8'}
                                    onMouseLeave={e => e.target.style.color = '#64748b'}
                                >{item}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
