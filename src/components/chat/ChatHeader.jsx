import { useAuth } from '../../contexts/AuthContext';

/**
 * ChatHeader — name, avatar, online status, typing indicator.
 */
const ChatHeader = ({ conversation, presenceHook, onBack, onOpenGroupInfo }) => {
  const { currentUser } = useAuth();
  const conv = conversation;
  if (!conv) return null;

  let name, avatarUrl, statusText;

  if (conv.type === 'direct') {
    const partner = conv.dmPartner;
    name = partner?.display_name || 'Unknown';
    avatarUrl = partner?.avatar_url;

    // Typing indicator
    const typingInConv = presenceHook.getTypingInConversation(conv.id);
    if (typingInConv.length > 0) {
      statusText = 'typing...';
    } else if (partner && presenceHook.isUserOnline(partner.id)) {
      statusText = 'online';
    } else if (partner?.last_seen) {
      const lastSeen = new Date(partner.last_seen);
      const now = new Date();
      const diff = now - lastSeen;
      if (diff < 60000) statusText = 'last seen just now';
      else if (diff < 3600000) statusText = `last seen ${Math.floor(diff / 60000)}m ago`;
      else if (diff < 86400000) statusText = `last seen ${Math.floor(diff / 3600000)}h ago`;
      else statusText = `last seen ${lastSeen.toLocaleDateString()}`;
    }
  } else {
    name = conv.name || 'Group';
    avatarUrl = conv.avatar_url;

    // Group: show typing or member count
    const typingInConv = presenceHook.getTypingInConversation(conv.id);
    if (typingInConv.length > 0) {
      // Find who's typing
      const typingNames = typingInConv.map(uid => {
        const member = conv.conversation_members?.find(m => m.user_id === uid);
        return member?.profiles?.display_name || 'Someone';
      });
      statusText = `${typingNames.join(', ')} typing...`;
    } else {
      statusText = `${conv.memberCount} members`;
    }
  }

  const isTyping = statusText === 'typing...' || statusText?.includes('typing...');

  return (
    <div className="chat-header">
      {/* Back button for mobile */}
      <button className="icon-btn" onClick={onBack} style={{ display: 'none' }}>
        ←
      </button>

      <div
        className="chat-header-avatar"
        style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
        onClick={conv.type === 'group' ? onOpenGroupInfo : undefined}
      >
        {!avatarUrl && (
          <div className="flex-center" style={{
            width: '100%', height: '100%', borderRadius: '50%',
            fontSize: '18px', color: 'var(--text-secondary)',
          }}>
            {conv.type === 'group' ? '👥' : name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div
        className="chat-header-info"
        onClick={conv.type === 'group' ? onOpenGroupInfo : undefined}
      >
        <div className="chat-header-name">{name}</div>
        {statusText && (
          <div className={`chat-header-status ${isTyping ? 'typing' : ''}`}>
            {statusText}
          </div>
        )}
      </div>

      {conv.type === 'group' && (
        <button className="icon-btn" onClick={onOpenGroupInfo} title="Group Info">
          ℹ️
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
