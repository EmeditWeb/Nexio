import { useState } from 'react';
import ImagePreview from './ImagePreview';

/**
 * MessageBubble — single message with content, reply quote, timestamps,
 * read receipts, sender name in groups, and image support.
 */
const MessageBubble = ({ message, isSent, isGroup, isFirstInGroup, onContextMenu, onReply }) => {
  const [showImagePreview, setShowImagePreview] = useState(false);

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Deleted message
  if (message.is_deleted) {
    return (
      <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
        <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
          <span className="message-deleted">🚫 This message was deleted</span>
          <div className="message-meta">
            <span className="message-time">{formatTime(message.created_at)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`message-wrapper ${isSent ? 'sent' : 'received'}`}
        onContextMenu={onContextMenu}
      >
        <div className={`message-bubble ${isSent ? 'sent' : 'received'} ${isFirstInGroup ? 'first-in-group' : ''}`}>
          {/* Sender name in groups */}
          {isGroup && !isSent && isFirstInGroup && message.sender && (
            <div className="message-sender-name">
              {message.sender.display_name || message.sender.username}
            </div>
          )}

          {/* Reply quote */}
          {message.reply_message && (
            <div className="message-reply-quote">
              <div className="message-reply-quote-author">
                {message.reply_message.user_id === message.user_id ? 'You' : ''}
              </div>
              <div>{message.reply_message.content || '📷 Photo'}</div>
            </div>
          )}

          {/* Image */}
          {message.message_type === 'image' && message.media_url && (
            <img
              src={message.media_url}
              alt="Shared"
              className="message-image"
              onClick={() => setShowImagePreview(true)}
            />
          )}

          {/* Text content */}
          {message.content && (
            <span className="message-content">{message.content}</span>
          )}

          {/* Meta: time + ticks */}
          <div className="message-meta">
            <span className="message-time">{formatTime(message.created_at)}</span>
            {isSent && (
              <span className="message-ticks">✓✓</span>
            )}
          </div>
        </div>
      </div>

      {/* Full-size image viewer */}
      {showImagePreview && message.media_url && (
        <ImagePreview
          src={message.media_url}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;
