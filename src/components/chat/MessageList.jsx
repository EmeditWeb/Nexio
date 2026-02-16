import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { getDateLabel } from '../../utils/dateUtils';

/**
 * MessageList — scrollable message area with date dividers, scroll-to-bottom, and pagination.
 */
const MessageList = ({
  messages, loading, loadingMore, hasMore, onLoadMore,
  currentUserId, conversationId, chatHook, onReply,
}) => {
  const listRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const prevLengthRef = useRef(0);
  const isFirstLoad = useRef(true);

  // Auto-scroll to bottom on first load or new messages
  useEffect(() => {
    if (!listRef.current || messages.length === 0) return;

    if (isFirstLoad.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      isFirstLoad.current = false;
      prevLengthRef.current = messages.length;
      return;
    }

    // Only auto-scroll if user is near the bottom
    const el = listRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    if (nearBottom || messages.length > prevLengthRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    prevLengthRef.current = messages.length;
  }, [messages]);

  // Reset first load flag when conversation changes
  useEffect(() => { isFirstLoad.current = true; }, [conversationId]);

  // Handle scroll — show/hide scroll button, load older messages
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distFromBottom > 300);

    // Load older messages when scrolled to top
    if (el.scrollTop < 50 && hasMore && !loadingMore) {
      const prevHeight = el.scrollHeight;
      onLoadMore().then(() => {
        // Maintain scroll position after prepending older messages
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevHeight;
        });
      });
    }
  }, [hasMore, loadingMore, onLoadMore]);

  const scrollToBottom = () => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  // Group messages by date for dividers
  const messagesWithDividers = useMemo(() => {
    const items = [];
    let lastDate = '';
    messages.forEach(msg => {
      const dateStr = new Date(msg.created_at).toDateString();
      if (dateStr !== lastDate) {
        items.push({ type: 'divider', date: msg.created_at, key: `div-${dateStr}` });
        lastDate = dateStr;
      }
      items.push({ type: 'message', data: msg, key: msg.id });
    });
    return items;
  }, [messages]);

  // Skeleton loader
  if (loading) {
    return (
      <div className="message-list" style={{ justifyContent: 'flex-end' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`skeleton-message ${i % 3 === 0 ? 'sent' : 'received'}`}>
            <div className="skeleton skeleton-bubble" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👋</div>
          <p style={{ fontSize: '14px' }}>No messages yet. Say hello!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="message-list" ref={listRef} onScroll={handleScroll}>
        {loadingMore && (
          <div className="flex-center" style={{ padding: '12px' }}>
            <div className="splash-spinner" style={{ width: '20px', height: '20px' }} />
          </div>
        )}

        {messagesWithDividers.map(item => {
          if (item.type === 'divider') {
            return (
              <div key={item.key} className="message-date-divider">
                <span>{getDateLabel(item.date)}</span>
              </div>
            );
          }

          const msg = item.data;
          return (
            <MessageBubble
              key={item.key}
              message={msg}
              isSent={msg.user_id === currentUserId}
              onReply={() => onReply(msg)}
              onDelete={(forEveryone) => chatHook.deleteMessage(msg.id, forEveryone)}
            />
          );
        })}
      </div>

      {showScrollBottom && (
        <button className="scroll-to-bottom" onClick={scrollToBottom} aria-label="Scroll to bottom">
          ↓
        </button>
      )}
    </>
  );
};

export default MessageList;
