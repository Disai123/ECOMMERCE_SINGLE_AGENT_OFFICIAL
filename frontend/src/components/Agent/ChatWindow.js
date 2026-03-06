import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { agentAPI } from '../../api/agent';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ChatWindow = ({ onClose }) => {
    const { user } = useAuth();
    const { syncCart } = useCart();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const getSessionId = () => {
        let sid = localStorage.getItem('agent_session');
        if (!sid) { sid = Math.random().toString(36).substring(7); localStorage.setItem('agent_session', sid); }
        return sid;
    };
    const sessionId = getSessionId();

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const syncAgentCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const agentCartItems = await agentAPI.getCart(sessionId, token);
            syncCart(agentCartItems.map(item => ({
                id: item.product_id, name: item.name, price: item.price, quantity: item.quantity,
            })));
        } catch (err) { console.error('Cart sync failed:', err); }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const history = await agentAPI.getHistory(sessionId, token);
                setMessages(history);
                await syncAgentCart();
            } catch (err) { console.error('Failed to load history', err); }
        };
        fetchHistory();
    }, [sessionId]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await agentAPI.sendMessage(text, sessionId, token);
            setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
            await syncAgentCart();
        } catch {
            setMessages(prev => [...prev, { role: 'system', content: 'Something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const hints = ['Search headphones', 'Show my cart', 'Best laptops under $1000'];

    return (
        <div style={{
            width: 380, height: 560, borderRadius: 22, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            background: '#fff',
            boxShadow: '0 30px 80px rgba(99,102,241,.22), 0 8px 24px rgba(0,0,0,.1)',
            border: '1px solid rgba(99,102,241,.12)',
        }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', border: '1.5px solid rgba(255,255,255,.3)' }}>🤖</div>
                    <div>
                        <p style={{ color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '.9rem', lineHeight: 1 }}>AI Shopping Assistant</p>
                        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block', boxShadow: '0 0 6px #6ee7b7' }} />
                            Online
                        </p>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
                >✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', background: '#f8faff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                        <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>👋</div>
                        <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            Hi{user ? `, ${user.email?.split('@')[0]}` : ''}!
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '.82rem', marginBottom: 18, lineHeight: 1.6 }}>
                            I can help you find products, manage your cart, and checkout. Try:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
                            {hints.map(h => (
                                <button key={h} onClick={() => setInputText(h)}
                                    style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '6px 14px', fontSize: '.76rem', fontWeight: 600, color: '#6366f1', cursor: 'pointer', transition: 'all .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#6366f1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => <MessageBubble key={idx} role={msg.role} content={msg.content} />)}
                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0 }}>🤖</div>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px 14px 14px 4px', padding: '10px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                            {[0, 150, 300].map(delay => (
                                <div key={delay} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', animation: `bounce-dot 1.2s ease-in-out ${delay}ms infinite` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid #f1f5f9', background: '#fff', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <input value={inputText} onChange={e => setInputText(e.target.value)}
                    placeholder="Ask me anything…" disabled={isLoading}
                    style={{
                        flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '10px 16px',
                        fontSize: '.875rem', outline: 'none', transition: 'border-color .2s', background: '#f8faff',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="submit" disabled={isLoading || !inputText.trim()}
                    style={{
                        width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: inputText.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#f1f5f9',
                        color: inputText.trim() ? '#fff' : '#cbd5e1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s', flexShrink: 0,
                    }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
