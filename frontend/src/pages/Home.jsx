import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

/* ── Toast notification ── */
const Toast = ({ msg, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="toast" style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
            minWidth: 220, fontSize: '.9rem', fontWeight: 600,
        }}>
            <span style={{ fontSize: '1.1rem' }}>🛒</span> {msg}
        </div>
    );
};

/* ── Skeleton card ── */
const SkeletonCard = () => (
    <div style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow-card)', border: '1px solid var(--clr-border)' }}>
        <div className="skeleton" style={{ height: 220 }} />
        <div style={{ padding: 18 }}>
            <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '65%', marginBottom: 18 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ height: 24, width: '35%' }} />
                <div className="skeleton" style={{ height: 34, width: '30%', borderRadius: 10 }} />
            </div>
        </div>
    </div>
);

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Books'];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [toast, setToast] = useState('');
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/products/')
            .then(res => { setProducts(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = products.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'All' || p.category === category;
        return matchSearch && matchCat;
    });

    const handleQuickAdd = useCallback((e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        setToast(`${product.name} added!`);
    }, [addToCart]);

    const featuredCategories = [
        { label: 'Electronics', emoji: '⚡', color: '#dbeafe', text: '#1e40af' },
        { label: 'Clothing', emoji: '👗', color: '#fce7f3', text: '#9d174d' },
        { label: 'Home & Garden', emoji: '🏡', color: '#d1fae5', text: '#065f46' },
        { label: 'Books', emoji: '📚', color: '#fef3c7', text: '#92400e' },
    ];

    return (
        <div className="fade-in-up">
            {toast && <Toast msg={toast} onDone={() => setToast('')} />}

            {/* ── Hero ── */}
            <div className="hero-gradient" style={{ borderRadius: 24, padding: '64px 48px', marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,92,246,.18)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,.15)' }} />
                <div style={{ position: 'absolute', top: '50%', right: '15%', transform: 'translateY(-50%)', fontSize: '7rem', opacity: .15, userSelect: 'none' }}>🛍️</div>

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
                    <span style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: '.72rem', fontWeight: 700, padding: '5px 14px', borderRadius: 99, letterSpacing: '.08em', textTransform: 'uppercase', display: 'inline-block', marginBottom: 18, border: '1px solid rgba(255,255,255,.2)' }}>
                        🔥 New Arrivals · Spring 2025
                    </span>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, lineHeight: 1.1, marginBottom: 18 }}>
                        Shop Smarter<br />
                        <span style={{ background: 'linear-gradient(90deg,#c4b5fd,#6ee7f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            With AI
                        </span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '1.05rem', marginBottom: 32, lineHeight: 1.7 }}>
                        Discover trending products across every category. Your personal AI assistant helps you find exactly what you need.
                    </p>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <button onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}
                            style={{ background: '#fff', color: '#6366f1', border: 'none', padding: '13px 28px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,.18)', transition: 'all .2s' }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            🛒 Shop Now
                        </button>
                        <button
                            onClick={() => { /* trigger agent */ document.querySelector('[data-agent-btn]')?.click(); }}
                            style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', padding: '13px 28px', borderRadius: 14, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
                        >
                            ✨ Ask AI Assistant
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', gap: 20, marginTop: 32, flexWrap: 'wrap' }}>
                        {[['🔒', 'Secure Pay'], ['🚚', 'Free Shipping'], ['↩️', 'Free Returns'], ['⭐', '4.9 Rating']].map(([icon, label]) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.75)', fontSize: '.8rem', fontWeight: 500 }}>
                                <span>{icon}</span> {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Category Quick Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }}>
                {featuredCategories.map(cat => (
                    <button key={cat.label} onClick={() => setCategory(cat.label)}
                        style={{
                            padding: '18px 14px', borderRadius: 16, border: `2px solid ${category === cat.label ? '#6366f1' : 'transparent'}`,
                            background: cat.color, cursor: 'pointer', transition: 'all .2s',
                            display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: category === cat.label ? '0 0 0 4px rgba(99,102,241,.15)' : 'none',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ fontSize: '1.4rem' }}>{cat.emoji}</span>
                        <span style={{ fontWeight: 700, fontSize: '.875rem', color: cat.text }}>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Search + Filter ── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: .4 }} width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input className="input-field" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search products, brands..." style={{ paddingLeft: 42 }} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['All', ...CATEGORIES.slice(1)].map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)} style={{
                            padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${category === cat ? '#6366f1' : '#e2e8f0'}`,
                            background: category === cat ? '#6366f1' : '#fff',
                            color: category === cat ? '#fff' : '#64748b',
                            fontWeight: 600, fontSize: '.82rem', cursor: 'pointer', transition: 'all .18s'
                        }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Products heading ── */}
            <div id="products-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {search || category !== 'All' ? `Results (${filtered.length})` : 'Featured Products'}
                </h2>
                {!loading && <span style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: 500 }}>{filtered.length} items</span>}
            </div>

            {/* ── Grid ── */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 22 }}>
                    {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>No products found</h3>
                    <p style={{ color: '#94a3b8' }}>Try a different keyword or category.</p>
                    <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => { setSearch(''); setCategory('All'); }}>Clear Filters</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 22 }} className="stagger-children">
                    {filtered.map(product => (
                        <div key={product.id} className="product-card card card-hover"
                            style={{ cursor: 'pointer', overflow: 'hidden' }}
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            {/* Image */}
                            <div style={{ height: 218, background: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        <span style={{ fontSize: '2.5rem' }}>📦</span>
                                        <span style={{ fontSize: '.75rem', marginTop: 8 }}>No Image</span>
                                    </div>
                                )}
                                {/* Quick add overlay */}
                                <div className="overlay">
                                    <button className="btn btn-sm" onClick={e => handleQuickAdd(e, product)}
                                        style={{ background: '#fff', color: '#6366f1', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>
                                        + Quick Add
                                    </button>
                                </div>
                                {/* Stock badge */}
                                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                                    <span className="badge badge-yellow" style={{ position: 'absolute', top: 10, left: 10 }}>Only {product.stock_quantity} left</span>
                                )}
                                {product.stock_quantity === 0 && (
                                    <span className="badge badge-red" style={{ position: 'absolute', top: 10, left: 10 }}>Out of Stock</span>
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ padding: '16px 18px 18px' }}>
                                {product.category && (
                                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '.06em' }}>{product.category}</span>
                                )}
                                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '.97rem', color: '#0f172a', marginTop: 4, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {product.name}
                                </h3>
                                <p style={{ fontSize: '.8rem', color: '#94a3b8', marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {product.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                        ${parseFloat(product.price).toFixed(2)}
                                    </span>
                                    <Link to={`/product/${product.id}`} onClick={e => e.stopPropagation()}
                                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '7px 16px', borderRadius: 10, fontSize: '.8rem', fontWeight: 600, textDecoration: 'none', transition: 'all .18s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        View →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
