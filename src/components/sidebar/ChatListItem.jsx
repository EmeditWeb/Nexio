import { formatSmartTimestamp } from '../../utils/dateUtils';

/**
 * ChatListItem — single conversation item with online dot, smart timestamps, and unread badge.
 */
const ChatListItem = ({ conversation, active, onClick, presenceHook }) => {
  const conv = conversation;
  const isGroup = conv.type === 'group';

  // Display info
  const name = isGroup ? conv.name : conv.dmPartner?.display_name || 'Unknown';
  const username = isGroup ? `${conv.memberCount} members` : `@${conv.dmPartner?.username || ''}`;
  const avatarUrl = isGroup ? conv.avatar_url : conv.dmPartner?.avatar_url;
  const isOnline = !isGroup && conv.dmPartner?.is_online;
  const hasUnread = conv.unreadCount > 0;

  // Last message preview
  let preview = '';
  if (conv.lastMessage) {
    if (conv.lastMessage.is_deleted) preview = '🚫 Message deleted';
    else if (conv.lastMessage.message_type === 'image') preview = '📷 Photo';
    else preview = conv.lastMessage.content || '';
  }

  const time = conv.lastMessage ? formatSmartTimestamp(conv.lastMessage.created_at) : '';

  return (
    <div
      className={`chat-list-item ${active ? 'active' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      role="button"
      tabIndex={0}
      aria-label={`Chat with ${name}`}
    >
      <div
        className="chat-list-avatar"
        style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
      >
        {!avatarUrl && (
          <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '18px', color: 'var(--text-secondary)' }}>
            {isGroup ? '👥' : name[0]?.toUpperCase() || '?'}
          </div>
        )}
        {isOnline && <div className="online-dot" />}
      </div>

      <div className="chat-list-info">
        <div className="chat-list-top">
          <span className={`chat-list-name ${hasUnread ? 'unread' : ''}`}>{name}</span>
          <span className={`chat-list-time ${hasUnread ? 'unread' : ''}`}>{time}</span>
        </div>
        <div className="chat-list-bottom">
          <span className="chat-list-preview">{preview || username}</span>
          {hasUnread && <span className="unread-badge">{conv.unreadCount}</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
