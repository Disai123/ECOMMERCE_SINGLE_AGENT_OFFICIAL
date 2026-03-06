import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusConfig = {
    Pending: { color: '#f59e0b', bg: '#fef3c7', label: '⏳ Pending' },
    Shipped: { color: '#3b82f6', bg: '#dbeafe', label: '🚚 Shipped' },
    Delivered: { color: '#10b981', bg: '#d1fae5', label: '✅ Delivered' },
    Cancelled: { color: '#ef4444', bg: '#fee2e2', label: '✕ Cancelled' },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        api.get('/orders/')
            .then(res => { setOrders(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ padding: '24px 0' }}>
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 96, borderRadius: 16, marginBottom: 14 }} />
            ))}
        </div>
    );

    if (orders.length === 0) return (
        <div className="fade-in-up" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: 20 }}>📦</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>No orders yet</h2>
            <p style={{ color: '#94a3b8', marginBottom: 28 }}>Your order history will appear here once you make a purchase.</p>
            <Link to="/" className="btn btn-primary btn-lg">🛍️ Start Shopping</Link>
        </div>
    );

    return (
        <div className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
                    My Orders
                </h1>
                <span style={{ fontSize: '.875rem', color: '#94a3b8', fontWeight: 500 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map(order => {
                    const cfg = statusConfig[order.status] || statusConfig.Pending;
                    const isOpen = expanded === order.id;
                    return (
                        <div key={order.id} className="card"
                            style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all .25s' }}
                            onClick={() => setExpanded(isOpen ? null : order.id)}
                        >
                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', gap: 16, flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    {/* Status icon */}
                                    <div style={{ width: 46, height: 46, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        {order.status === 'Pending' ? '⏳' : order.status === 'Shipped' ? '🚚' : order.status === 'Delivered' ? '✅' : '✕'}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>Order #{order.id}</p>
                                        <p style={{ fontSize: '.8rem', color: '#94a3b8', marginTop: 2 }}>
                                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            {' · '}{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#6366f1' }}>
                                        ${parseFloat(order.total_amount).toFixed(2)}
                                    </span>
                                    <span style={{ padding: '4px 12px', borderRadius: 99, background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '.78rem' }}>
                                        {cfg.label}
                                    </span>
                                    <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"
                                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s', flexShrink: 0 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Expanded items */}
                            {isOpen && (
                                <div className="fade-in" style={{ borderTop: '1px solid #f1f5f9', padding: '16px 22px' }}>
                                    <p style={{ fontWeight: 700, fontSize: '.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Items Ordered</p>
                                    {order.items?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {order.items.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.875rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                                                        <span style={{ color: '#334155' }}>
                                                            {item.product_name || `Product #${item.product_id}`} × {item.quantity}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                                        ${(item.price_at_purchase * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '.875rem' }}>No item details available.</p>
                                    )}

                                    {/* Status timeline */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 20 }}>
                                        {['Pending', 'Shipped', 'Delivered'].map((s, i, arr) => {
                                            const done = ['Pending', 'Shipped', 'Delivered'].indexOf(order.status) >= i;
                                            return (
                                                <React.Fragment key={s}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? '#6366f1' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {done && <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <span style={{ fontSize: '.68rem', fontWeight: 600, color: done ? '#6366f1' : '#cbd5e1' }}>{s}</span>
                                                    </div>
                                                    {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: done && order.status !== s ? '#6366f1' : '#e2e8f0', marginBottom: 16 }} />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Orders;
