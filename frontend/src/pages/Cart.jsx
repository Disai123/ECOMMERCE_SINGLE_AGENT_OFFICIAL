import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart, syncCart, total } = useCart();
    const navigate = useNavigate();

    const updateQty = (productId, newQty) => {
        if (newQty < 1) { removeFromCart(productId); return; }
        syncCart(cart.map(item => item.id === productId ? { ...item, quantity: newQty } : item));
    };

    const shipping = total > 99 ? 0 : total > 0 ? 8.99 : 0;
    const grandTotal = total + shipping;

    if (cart.length === 0) return (
        <div className="fade-in-up" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '5rem', marginBottom: 20 }}>🛒</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Your cart is empty</h2>
            <p style={{ color: '#94a3b8', marginBottom: 28 }}>Looks like you haven't added anything yet.</p>
            <Link to="/" className="btn btn-primary btn-lg">🏪 Start Shopping</Link>
        </div>
    );

    return (
        <div className="fade-in-up">
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 28 }}>
                Shopping Cart <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>({cart.length} item{cart.length > 1 ? 's' : ''})</span>
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
                {/* ── Items ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {cart.map((item) => (
                        <div key={item.id} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
                            {/* Thumbnail */}
                            <div style={{ width: 88, height: 88, borderRadius: 14, background: '#f1f5f9', flexShrink: 0, overflow: 'hidden' }}>
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📦</div>
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.name}
                                </p>
                                <p style={{ fontSize: '.82rem', color: '#94a3b8', marginBottom: 12 }}>${parseFloat(item.price).toFixed(2)} each</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button className="qty-btn" onClick={() => updateQty(item.id, (item.quantity || 1) - 1)}>−</button>
                                    <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: '.95rem' }}>{item.quantity || 1}</span>
                                    <button className="qty-btn" onClick={() => updateQty(item.id, (item.quantity || 1) + 1)}>+</button>
                                </div>
                            </div>

                            {/* Price + remove */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#6366f1', marginBottom: 12 }}>
                                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                                </p>
                                <button onClick={() => removeFromCart(item.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#cbd5e1', fontSize: '1.1rem', transition: 'color .15s',
                                }}
                                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                                    onMouseLeave={e => e.target.style.color = '#cbd5e1'}
                                    title="Remove"
                                >✕</button>
                            </div>
                        </div>
                    ))}

                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6366f1', fontWeight: 600, fontSize: '.875rem', padding: '14px 0', textDecoration: 'none' }}>
                        ← Continue Shopping
                    </Link>
                </div>

                {/* ── Order Summary ── */}
                <div style={{ position: 'sticky', top: 90 }}>
                    <div className="card" style={{ padding: '24px 22px' }}>
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.15rem', marginBottom: 22, color: '#0f172a' }}>Order Summary</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Subtotal */}
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: '#64748b' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                                        {item.name} × {item.quantity || 1}
                                    </span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="divider" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', color: '#475569' }}>
                                <span>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>${total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', color: '#475569' }}>
                                <span>Shipping</span>
                                <span style={{ fontWeight: 600, color: shipping === 0 ? '#10b981' : '#334155' }}>
                                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            {shipping > 0 && (
                                <p style={{ fontSize: '.75rem', color: '#94a3b8', background: '#fef9ec', borderRadius: 8, padding: '6px 10px' }}>
                                    🚚 Add ${(99 - total).toFixed(2)} more for free shipping
                                </p>
                            )}
                        </div>

                        <div className="divider" />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
                            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem' }}>Total</span>
                            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#6366f1' }}>${grandTotal.toFixed(2)}</span>
                        </div>

                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/checkout')}
                            style={{ width: '100%', justifyContent: 'center' }}>
                            Proceed to Checkout →
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '.75rem', color: '#94a3b8', marginTop: 14 }}>
                            🔒 Secure checkout · SSL encrypted
                        </p>
                    </div>

                    {/* Promo code */}
                    <div className="card" style={{ padding: '18px 22px', marginTop: 14 }}>
                        <p style={{ fontWeight: 700, fontSize: '.875rem', marginBottom: 12, color: '#334155' }}>🎟 Promo Code</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input className="input-field" placeholder="Enter code" style={{ flex: 1, padding: '9px 14px', fontSize: '.85rem' }} />
                            <button className="btn btn-outline btn-sm">Apply</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
