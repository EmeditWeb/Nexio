import { useState } from 'react';
import { formatMessageTime } from '../../utils/dateUtils';
import ImagePreview from './ImagePreview';

/**
 * MessageBubble — sent/received message with gradient, read receipts, reply quote, context menu.
 */
const MessageBubble = ({ message, isSent, onReply, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showImage, setShowImage] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const closeMenu = () => setShowMenu(false);

  // Deleted message
  if (message.is_deleted) {
    return (
      <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
        <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
          <span className="message-deleted">🚫 This message was deleted</span>
          <div className="message-meta">
            <span className="message-time">{formatMessageTime(message.created_at)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Sender name for group messages
  const senderName = !isSent && message.sender?.display_name;

  return (
    <>
      <div className={`message-wrapper ${isSent ? 'sent' : 'received'} ${message._optimistic ? 'message-sending' : ''}`}>
        <div
          className={`message-bubble ${isSent ? 'sent' : 'received'}`}
          onContextMenu={handleContextMenu}
        >
          {senderName && <div className="message-sender-name">{senderName}</div>}

          {/* Reply quote */}
          {message.reply_message && (
            <div className="message-reply-quote">
              <div className="message-reply-quote-author">
                {message.reply_message.user_id === message.user_id ? 'You' : 'Reply'}
              </div>
              {message.reply_message.message_type === 'image' ? '📷 Photo' : message.reply_message.content}
            </div>
          )}

          {/* Image message */}
          {message.message_type === 'image' && message.media_url && (
            <img
              className="message-image"
              src={message.media_url}
              alt="Shared"
              loading="lazy"
              onClick={() => setShowImage(true)}
            />
          )}

          {/* Text content */}
          {message.content && (
            <span className="message-content">{message.content}</span>
          )}

          <div className="message-meta">
            <span className="message-time">{formatMessageTime(message.created_at)}</span>
            {isSent && (
              <span className={`message-ticks ${message.read ? 'read' : ''}`}>
                {message._optimistic ? '⏳' : message.read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={closeMenu} />
          <div className="context-menu" style={{ left: menuPos.x, top: menuPos.y }}>
            <div className="context-menu-item" onClick={() => { onReply(); closeMenu(); }}>
              ↩️ Reply
            </div>
            <div className="context-menu-item" onClick={() => {
              navigator.clipboard.writeText(message.content || '');
              closeMenu();
            }}>
              📋 Copy
            </div>
            {isSent && (
              <div className="context-menu-item danger" onClick={() => { onDelete(true); closeMenu(); }}>
                🗑️ Delete for everyone
              </div>
            )}
            <div className="context-menu-item danger" onClick={() => { onDelete(false); closeMenu(); }}>
              🗑️ Delete for me
            </div>
          </div>
        </>
      )}

      {/* Image Lightbox */}
      {showImage && (
        <ImagePreview src={message.media_url} onClose={() => setShowImage(false)} />
      )}
    </>
  );
};

export default MessageBubble;
