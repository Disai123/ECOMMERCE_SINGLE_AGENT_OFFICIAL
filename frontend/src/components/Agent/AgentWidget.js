import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../context/AuthContext';

const AgentWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

            {!isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                        fontSize: '.72rem', fontWeight: 700, padding: '5px 14px',
                        borderRadius: 99, boxShadow: '0 6px 20px rgba(99,102,241,.4)',
                        animation: 'fadeInUp .3s ease both',
                        letterSpacing: '.02em',
                    }}>
                        ✨ AI Shopping Assistant
                    </div>
                    <button
                        data-agent-btn
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: 58, height: 58, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            border: 'none', cursor: 'pointer', fontSize: '1.4rem',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 6px 24px rgba(99,102,241,.45), 0 0 0 6px rgba(99,102,241,.12)',
                            transition: 'all .2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,.55), 0 0 0 8px rgba(99,102,241,.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,.45), 0 0 0 6px rgba(99,102,241,.12)'; }}
                    >
                        💬
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgentWidget;
