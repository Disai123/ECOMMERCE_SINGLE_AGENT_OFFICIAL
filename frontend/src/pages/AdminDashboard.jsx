import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const StatCard = ({ icon, label, value, color }) => (
    <div className="card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</p>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock_quantity: '', description: '' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const [pRes, oRes] = await Promise.all([api.get('/products/'), api.get('/orders/admin/all')]);
        setProducts(pRes.data);
        setOrders(oRes.data);
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            await api.post('/products/', newProduct);
            setFormSuccess('✅ Product created!');
            setNewProduct({ name: '', price: '', stock_quantity: '', description: '' });
            setShowForm(false);
            fetchData();
        } catch {
            setFormError('Failed to create product. Check all fields.');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        await api.delete(`/products/${id}`);
        fetchData();
    };

    const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    return (
        <div className="fade-in-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>Admin Dashboard</h1>
                    <p style={{ color: '#94a3b8', fontSize: '.875rem', marginTop: 4 }}>Manage your ShopEasy catalog and orders</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
                    {showForm ? '✕ Cancel' : '+ Add Product'}
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
                <StatCard icon="📦" label="Total Products" value={products.length} color="#6366f1" />
                <StatCard icon="🛒" label="Total Orders" value={orders.length} color="#8b5cf6" />
                <StatCard icon="💰" label="Total Revenue" value={`$${revenue.toFixed(0)}`} color="#10b981" />
                <StatCard icon="⏳" label="Pending Orders" value={pendingOrders} color="#f59e0b" />
            </div>

            {/* Add product form */}
            {showForm && (
                <div className="card scale-in" style={{ padding: '24px 28px', marginBottom: 28 }}>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>Add New Product</h2>
                    {formError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: '.875rem', marginBottom: 16 }}>{formError}</div>}
                    {formSuccess && <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '10px 14px', color: '#065f46', fontSize: '.875rem', marginBottom: 16 }}>{formSuccess}</div>}
                    <form onSubmit={handleCreateProduct}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 16 }}>
                            {[['name', 'Product Name', 'text', 'Wireless Headphones'],
                            ['price', 'Price ($)', 'number', '99.99'],
                            ['stock_quantity', 'Stock Quantity', 'number', '50'],
                            ].map(([name, label, type, ph]) => (
                                <div key={name}>
                                    <label className="input-label">{label}</label>
                                    <input className="input-field" type={type} placeholder={ph} value={newProduct[name]} required
                                        onChange={e => setNewProduct(p => ({ ...p, [name]: e.target.value }))} />
                                </div>
                            ))}
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label className="input-label">Description</label>
                            <input className="input-field" placeholder="Brief product description..." value={newProduct.description}
                                onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="submit" className="btn btn-primary">Create Product</button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Products table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Products ({products.length})</h2>
                    </div>
                    <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#f8faff' }}>
                                <tr>
                                    {['Name', 'Price', 'Stock', ''].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p, i) => (
                                    <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '.875rem', color: '#334155', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#6366f1', fontWeight: 700 }}>${parseFloat(p.price).toFixed(2)}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className={`badge ${p.stock_quantity > 10 ? 'badge-green' : p.stock_quantity > 0 ? 'badge-yellow' : 'badge-red'}`}>
                                                {p.stock_quantity}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)} style={{ padding: '4px 12px', fontSize: '.72rem' }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Orders table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Recent Orders ({orders.length})</h2>
                    </div>
                    <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#f8faff' }}>
                                <tr>
                                    {['Order', 'User', 'Total', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o, i) => {
                                    const statusClasses = { Pending: 'badge-yellow', Shipped: 'badge-blue', Delivered: 'badge-green', Cancelled: 'badge-red' };
                                    return (
                                        <tr key={o.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.875rem', color: '#334155' }}>#{o.id}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '.82rem', color: '#64748b' }}>User {o.user_id}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#6366f1', fontSize: '.875rem' }}>${parseFloat(o.total_amount).toFixed(2)}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span className={`badge ${statusClasses[o.status] || 'badge-indigo'}`}>{o.status}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
