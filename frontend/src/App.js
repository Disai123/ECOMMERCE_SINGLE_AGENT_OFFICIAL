import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AgentWidget from './components/Agent/AgentWidget';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user && user.is_admin ? children : <Navigate to="/" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="product/:id" element={<ProductDetail />} />
                            <Route path="login" element={<Login />} />
                            <Route path="cart" element={<Cart />} />

                            {/* Protected Routes */}
                            <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                            <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />

                            {/* Admin Routes */}
                            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        </Route>
                    </Routes>
                    <AgentWidget />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
