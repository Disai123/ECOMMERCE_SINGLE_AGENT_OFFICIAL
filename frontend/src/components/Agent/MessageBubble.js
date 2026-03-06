import React from 'react';

const MessageBubble = ({ role, content }) => {
    const isUser = role === 'user';

    const formatted = content.split('\n').map((line, i) => (
        <span key={i} style={{ display: 'block', lineHeight: 1.5 }}>{line}</span>
    ));

    return (
        <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
            {!isUser && (
                <div style={{
                    width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', marginBottom: 2,
                }}>🤖</div>
            )}
            <div style={{
                maxWidth: '78%',
                padding: '9px 14px',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser
                    ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                    : '#fff',
                color: isUser ? '#fff' : '#334155',
                fontSize: '.85rem',
                fontWeight: 400,
                boxShadow: isUser
                    ? '0 4px 14px rgba(99,102,241,.35)'
                    : '0 1px 6px rgba(0,0,0,.06)',
                border: isUser ? 'none' : '1px solid #f0f4ff',
                wordBreak: 'break-word',
                lineHeight: 1.5,
            }}>
                {formatted}
            </div>
        </div>
    );
};

export default MessageBubble;
