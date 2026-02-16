import { useAuth } from '../../contexts/AuthContext';

/**
 * ChatListItem — single conversation row in the sidebar.
 * Shows avatar, name, last message preview, timestamp, unread badge, online dot.
 */
const ChatListItem = ({ conversation, active, onClick, presenceHook }) => {
  const { currentUser } = useAuth();
  const conv = conversation;

  // Determine display info based on conversation type
  let name, avatarUrl, isOnline;

  if (conv.type === 'direct') {
    const partner = conv.dmPartner;
    name = partner?.display_name || 'Unknown';
    avatarUrl = partner?.avatar_url;
    isOnline = partner ? presenceHook.isUserOnline(partner.id) : false;
  } else {
    name = conv.name || 'Group';
    avatarUrl = conv.avatar_url;
    isOnline = false;
  }

  // Format last message preview
  let preview = '';
  if (conv.lastMessage) {
    if (conv.lastMessage.is_deleted) {
      preview = '🚫 This message was deleted';
    } else if (conv.lastMessage.message_type === 'image') {
      preview = '📷 Photo';
    } else {
      preview = conv.lastMessage.content || '';
    }

    // Add sender name in groups
    if (conv.type === 'group' && !conv.lastMessage.is_deleted) {
      const senderName = conv.lastMessage.user_id === currentUser?.id
        ? 'You'
        : conv.conversation_members?.find(m => m.user_id === conv.lastMessage.user_id)?.profiles?.display_name || '';
      if (senderName) preview = `${senderName}: ${preview}`;
    }
  }

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const time = formatTime(conv.lastMessage?.created_at || conv.updated_at);
  const hasUnread = conv.unreadCount > 0;

  return (
    <div className={`chat-list-item ${active ? 'active' : ''}`} onClick={onClick}>
      <div
        className="chat-list-avatar"
        style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
      >
        {isOnline && <div className="online-dot" />}
        {!avatarUrl && (
          <div className="flex-center" style={{ width: '100%', height: '100%', fontSize: '20px', color: 'var(--text-secondary)' }}>
            {conv.type === 'group' ? '👥' : name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div className="chat-list-info">
        <div className="chat-list-top">
          <span className={`chat-list-name ${hasUnread ? 'unread' : ''}`}>{name}</span>
          <span className={`chat-list-time ${hasUnread ? 'unread' : ''}`}>{time}</span>
        </div>
        <div className="chat-list-bottom">
          <span className="chat-list-preview">{preview || '\u00A0'}</span>
          {hasUnread && (
            <span className="unread-badge">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
