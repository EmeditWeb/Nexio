import { useState, useRef, useCallback } from 'react';

/**
 * MessageInput — text input, emoji picker (simple), image upload, send button.
 * Shows reply preview when replying to a message.
 */
const MessageInput = ({ onSend, onSendImage, replyTo, onCancelReply, presenceHook, conversationId }) => {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const fileRef = useRef();
    const inputRef = useRef();
    const typingTimerRef = useRef(null);

    const commonEmojis = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '😍', '🤔', '💯', '😢', '😮', '🙏', '😎', '👋', '✨', '🤝', '💪', '🙌', '😅', '🥳'];

    const handleSend = useCallback(() => {
        if (!text.trim()) return;
        onSend(text, 'text', null, replyTo?.id || null);
        setText('');
        onCancelReply();
        setShowEmoji(false);
        inputRef.current?.focus();
    }, [text, onSend, replyTo, onCancelReply]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTyping = () => {
        if (presenceHook && conversationId) {
            presenceHook.setTyping(conversationId, true);
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => {
                presenceHook.setTyping(conversationId, false);
            }, 2000);
        }
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await onSendImage(file, replyTo?.id || null);
            onCancelReply();
        }
        e.target.value = '';
    };

    return (
        <>
            {/* Reply preview */}
            {replyTo && (
                <div className="reply-preview">
                    <div className="reply-preview-content">
                        <div className="reply-preview-author">
                            {replyTo.sender?.display_name || 'Message'}
                        </div>
                        <div className="reply-preview-text">
                            {replyTo.message_type === 'image' ? '📷 Photo' : replyTo.content}
                        </div>
                    </div>
                    <button className="reply-close-btn" onClick={onCancelReply}>✕</button>
                </div>
            )}

            {/* Emoji picker (simple) */}
            {showEmoji && (
                <div style={{
                    padding: '8px 16px',
                    background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    zIndex: 2,
                }}>
                    {commonEmojis.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => {
                                setText(prev => prev + emoji);
                                inputRef.current?.focus();
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '22px',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            <div className="message-input-container">
                <button
                    className="input-icon-btn"
                    onClick={() => setShowEmoji(!showEmoji)}
                    title="Emoji"
                >
                    😊
                </button>

                <button
                    className="input-icon-btn"
                    onClick={() => fileRef.current?.click()}
                    title="Attach Image"
                >
                    📎
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                />

                <div className="message-input-wrapper">
                    <textarea
                        ref={inputRef}
                        className="message-text-input"
                        placeholder="Type a message"
                        value={text}
                        onChange={e => { setText(e.target.value); handleTyping(); }}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                </div>

                <button className="send-btn" onClick={handleSend} title="Send">
                    ➤
                </button>
            </div>
        </>
    );
};

export default MessageInput;
