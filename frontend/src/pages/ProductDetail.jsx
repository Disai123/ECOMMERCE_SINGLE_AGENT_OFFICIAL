import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const Toast = ({ msg, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="toast" style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
            background: 'linear-gradient(135deg,#10b981,#059669)',
            color: '#fff', padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12,
            fontSize: '.9rem', fontWeight: 600, minWidth: 220,
        }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span> {msg}
        </div>
    );
};

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [toast, setToast] = useState('');
    const [addedAnim, setAddedAnim] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => navigate('/'));
    }, [id, navigate]);

    const handleAdd = () => {
        for (let i = 0; i < qty; i++) addToCart(product);
        setToast(`${qty} × ${product.name} added to cart!`);
        setAddedAnim(true);
        setTimeout(() => setAddedAnim(false), 1800);
    };

    if (!product) return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, padding: '24px 0' }}>
            <div className="skeleton" style={{ height: 440, borderRadius: 20 }} />
            <div>
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 36, width: '80%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 28, width: '30%', marginBottom: 24 }} />
                <div className="skeleton" style={{ height: 80, marginBottom: 24 }} />
                <div className="skeleton" style={{ height: 48, borderRadius: 14 }} />
            </div>
        </div>
    );

    return (
        <div className="fade-in-up">
            {toast && <Toast msg={toast} onDone={() => setToast('')} />}

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: '.83rem', color: '#94a3b8' }}>
                <Link to="/" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
                <span>›</span>
                <span>{product.category || 'Products'}</span>
                <span>›</span>
                <span style={{ color: '#334155', fontWeight: 600 }}>{product.name}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'start' }}>
                {/* ── Image panel ── */}
                <div style={{ borderRadius: 22, overflow: 'hidden', background: '#f1f5f9', position: 'relative', aspectRatio: '1', boxShadow: 'var(--shadow-md)' }}>
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease', cursor: 'zoom-in' }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#cbd5e1' }}>
                            <span style={{ fontSize: '3rem' }}>📦</span>
                            <p style={{ marginTop: 10, fontSize: '.85rem' }}>No Image</p>
                        </div>
                    )}
                </div>

                {/* ── Details panel ── */}
                <div>
                    {product.category && (
                        <span className="badge badge-indigo" style={{ marginBottom: 14 }}>{product.category}</span>
                    )}

                    <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                        {product.name}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#6366f1', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                            ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <span className={`badge ${product.stock_quantity > 0 ? 'badge-green' : 'badge-red'}`}>
                            {product.stock_quantity > 0 ? `✓ In Stock (${product.stock_quantity})` : '✗ Out of Stock'}
                        </span>
                    </div>

                    <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: 28, fontSize: '.97rem' }}>
                        {product.description}
                    </p>

                    {/* Qty stepper */}
                    {product.stock_quantity > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <label className="input-label">Quantity</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{qty}</span>
                                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}>+</button>
                            </div>
                        </div>
                    )}

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-lg" onClick={handleAdd}
                            disabled={product.stock_quantity <= 0}
                            style={{ flex: 1, justifyContent: 'center', transform: addedAnim ? 'scale(.96)' : 'scale(1)', transition: 'transform .2s' }}>
                            {addedAnim ? '✓ Added!' : '🛒 Add to Cart'}
                        </button>
                        <Link to="/cart" className="btn btn-outline btn-lg" style={{ flexShrink: 0 }}>View Cart</Link>
                    </div>

                    {/* Feature highlights */}
                    <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        {[
                            ['🚚', 'Free Shipping', 'On orders over $99'],
                            ['↩️', 'Free Returns', '30-day hassle-free'],
                            ['🔒', 'Secure Payment', '256-bit SSL encrypted'],
                        ].map(([icon, title, desc], i) => (
                            <div key={title} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '14px 18px',
                                borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none',
                            }}>
                                <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '.875rem', color: '#334155' }}>{title}</p>
                                    <p style={{ fontSize: '.78rem', color: '#94a3b8' }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
