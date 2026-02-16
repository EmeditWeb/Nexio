import { useState, useRef, useCallback, useEffect } from 'react';
import { useUpload } from '../../hooks/useUpload';
import { MAX_MESSAGE_LENGTH } from '../../utils/constants';

const EMOJI_LIST = ['😀', '😂', '🥰', '😍', '🤔', '😎', '🙌', '👍', '❤️', '🔥', '🎉', '✨', '💯', '🙏', '😢', '😡', '🤷', '👋', '🤝', '💪', '🫡', '😊', '🥺', '😏', '😴', '🤗', '🫶', '👀', '🤯', '🫠'];

/**
 * MessageInput — auto-resizing textarea, emoji picker, image upload, character counter.
 * Fixes:
 * - Removed onSendImage prop (now uses useUpload + onSend)
 * - Uses external replyTo/onClearReply props
 */
const MessageInput = ({ conversationId, onSend, sending, replyTo, onClearReply }) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { uploading, progress, error: uploadError, uploadChatImage, resetError } = useUpload();

  // Auto-resize textarea
  const handleTextChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length <= MAX_MESSAGE_LENGTH) {
      setText(val);
      // Auto-resize
      const ta = e.target;
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!text.trim() && !uploading) return;
    onSend(text.trim(), 'text', null, replyTo?.id || null);
    setText('');
    onClearReply && onClearReply();
    setShowEmoji(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, onSend, replyTo, uploading, onClearReply]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    // Upload using useUpload (handles validation, compression, progress)
    const result = await uploadChatImage(file, conversationId);
    
    // If successful, send the message with the returned URL
    if (result?.url) {
      onSend('', 'image', result.url, replyTo?.id || null);
      onClearReply && onClearReply();
    }
  }, [uploadChatImage, conversationId, onSend, replyTo, onClearReply]);

  const handleEmojiClick = (emoji) => {
    if (text.length + emoji.length <= MAX_MESSAGE_LENGTH) {
      setText(prev => prev + emoji);
      textareaRef.current?.focus();
    }
  };

  const charCount = text.length;
  const nearLimit = charCount > MAX_MESSAGE_LENGTH * 0.85;
  const canSend = text.trim().length > 0 && !sending && !uploading;

  return (
    <>
      {/* Upload progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="upload-progress-text">
            <span>Uploading image...</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="reply-preview" style={{ borderTop: '1px solid var(--danger)' }}>
          <div style={{ flex: 1, color: 'var(--danger)', fontSize: '13px' }}>
            ⚠️ {uploadError}
          </div>
          <button className="reply-close-btn" onClick={resetError}>✕</button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="emoji-picker">
          {EMOJI_LIST.map(e => (
            <button key={e} className="emoji-btn" onClick={() => handleEmojiClick(e)}>{e}</button>
          ))}
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <div className="reply-preview-author">
              Replying to {replyTo.sender?.display_name || 'User'}
            </div>
            <div className="reply-preview-text">
              {replyTo.message_type === 'image' ? '📷 Photo' : replyTo.content}
            </div>
          </div>
          <button className="reply-close-btn" onClick={onClearReply}>✕</button>
        </div>
      )}

      {/* Input bar */}
      <div className="message-input-container">
        <button
          className="input-icon-btn"
          onClick={() => setShowEmoji(!showEmoji)}
          title="Emoji"
          aria-label="Toggle emoji picker"
        >
          😊
        </button>

        <div className="message-input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-text-input"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message input"
          />
          {nearLimit && (
            <span className={`char-counter ${charCount > MAX_MESSAGE_LENGTH * 0.95 ? 'warning' : ''}`}>
              {charCount}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>

        <button
          className="input-icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach image"
          aria-label="Attach image"
        >
          📎
        </button>

        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!canSend}
          title="Send"
          aria-label="Send message"
        >
          {sending ? <div className="btn-spinner" /> : '➤'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
    </>
  );
};

export default MessageInput;
