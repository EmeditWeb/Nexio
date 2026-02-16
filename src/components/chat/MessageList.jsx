import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';

/**
 * MessageList — scrollable message area with auto-scroll and date dividers.
 */
const MessageList = ({
  messages,
  loading,
  currentUserId,
  conversation,
  onReply,
  onDelete,
  onMarkAsRead,
}) => {
  const endRef = useRef(null);
  const listRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark visible messages as read
  useEffect(() => {
    if (!messages.length || !currentUserId) return;

    const unreadByOthers = messages
      .filter(m => m.user_id !== currentUserId)
      .map(m => m.id);

    if (unreadByOthers.length > 0) {
      onMarkAsRead(unreadByOthers);
    }
  }, [messages, currentUserId, onMarkAsRead]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Group messages by date
  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000 && date.getDate() === now.getDate()) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="message-list">
        <div className="flex-center" style={{ flex: 1 }}>
          <span className="text-muted">Loading messages...</span>
        </div>
      </div>
    );
  }

  let lastDate = '';

  return (
    <div className="message-list" ref={listRef}>
      {messages.map((msg, idx) => {
        const msgDate = getDateLabel(msg.created_at);
        const showDateDivider = msgDate !== lastDate;
        lastDate = msgDate;

        // Check if this is the first message from this sender in a sequence
        const prevMsg = messages[idx - 1];
        const isFirstInGroup = !prevMsg || prevMsg.user_id !== msg.user_id;

        return (
          <div key={msg.id}>
            {showDateDivider && (
              <div className="message-date-divider">
                <span>{msgDate}</span>
              </div>
            )}
            <MessageBubble
              message={msg}
              isSent={msg.user_id === currentUserId}
              isGroup={conversation?.type === 'group'}
              isFirstInGroup={isFirstInGroup}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  message: msg,
                });
              }}
              onReply={() => onReply(msg)}
            />
          </div>
        );
      })}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              onReply(contextMenu.message);
              setContextMenu(null);
            }}
          >
            ↩️ Reply
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.message.content || '');
              setContextMenu(null);
            }}
          >
            📋 Copy
          </div>
          {contextMenu.message.user_id === currentUserId && (
            <>
              <div
                className="context-menu-item danger"
                onClick={() => {
                  onDelete(contextMenu.message.id, false);
                  setContextMenu(null);
                }}
              >
                🗑️ Delete for me
              </div>
              <div
                className="context-menu-item danger"
                onClick={() => {
                  onDelete(contextMenu.message.id, true);
                  setContextMenu(null);
                }}
              >
                🗑️ Delete for everyone
              </div>
            </>
          )}
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
