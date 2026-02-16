import { useState } from 'react';
import { formatLastSeen } from '../../utils/dateUtils';
import GroupInfoPanel from './GroupInfoPanel';

/**
 * ChatHeader — avatar, name, online/typing status, action icons.
 */
const ChatHeader = ({ conversation, presenceHook, onBack, convHook }) => {
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  if (!conversation) return null;

  const isGroup = conversation.type === 'group';
  const name = isGroup ? conversation.name : conversation.dmPartner?.display_name || 'Unknown';
  const avatarUrl = isGroup ? conversation.avatar_url : conversation.dmPartner?.avatar_url;
  const isOnline = !isGroup && conversation.dmPartner?.is_online;
  /* 1. Fix Typing Logic */
  const typingUserSet = presenceHook?.typingUsers?.[conversation.id] || new Set();
  const isTyping = typingUserSet.size > 0;

  let statusText = '';
  if (isTyping) {
    // Convert Set of IDs to array of names
    const typingNames = [];
    typingUserSet.forEach(userId => {
      // Find member in conversation members
      const member = conversation.conversation_members?.find(m => m.user_id === userId);
      if (member?.profiles?.display_name) typingNames.push(member.profiles.display_name);
      else typingNames.push('Someone');
    });

    statusText = typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : `${typingNames.join(', ')} are typing`;
  } else if (isGroup) {
    statusText = `${conversation.memberCount} members`;
  } else if (isOnline) {
    statusText = 'online';
  } else if (conversation.dmPartner?.last_seen) {
    statusText = formatLastSeen(conversation.dmPartner.last_seen);
  }

  return (
    <>
      <div className="chat-header">
        {/* 2. Fix Back Button Visibility (controlled by CSS now) */}
        <button className="icon-btn back-btn" onClick={onBack}>←</button>

        <div
          className="chat-header-avatar"
          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
          onClick={() => isGroup && setShowGroupInfo(true)}
        >
          {!avatarUrl && (
            <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '16px', color: 'var(--text-secondary)' }}>
              {isGroup ? '👥' : name[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        <div className="chat-header-info" onClick={() => isGroup && setShowGroupInfo(true)}>
          <div className="chat-header-name">{name}</div>
          <div className={`chat-header-status ${isTyping ? 'typing' : ''} ${isOnline && !isTyping ? 'online' : ''}`}>
            {isTyping ? (
              <span>
                {statusText} <span className="typing-dots"><span /><span /><span /></span>
              </span>
            ) : statusText}
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="icon-btn" title="Voice call">📞</button>
          <button className="icon-btn" title="Video call">📹</button>
          <button className="icon-btn" title="More options">⋮</button>
        </div>
      </div>

      {showGroupInfo && (
        <GroupInfoPanel
          conversation={conversation}
          onClose={() => setShowGroupInfo(false)}
          convHook={convHook}
        />
      )}
    </>
  );
};

export default ChatHeader;
