import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import GroupInfoPanel from './GroupInfoPanel';

/**
 * ChatPanel — right panel showing the active conversation or empty state.
 */
const ChatPanel = ({ className = '', conversation, conversationId, presenceHook, convHook, onBack }) => {
  const { currentUser } = useAuth();
  const chatHook = useChat(conversationId, currentUser?.id);

  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  if (!conversationId) {
    return (
      <div className={`chat-panel ${className}`}>
        <div className="chat-empty">
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>💬</div>
          <h2>Nexio</h2>
          <p>Send and receive messages in real-time. Select a chat from the sidebar or start a new conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-panel ${className}`}>
      <ChatHeader
        conversation={conversation}
        presenceHook={presenceHook}
        onBack={onBack}
        onOpenGroupInfo={() => setShowGroupInfo(true)}
      />

      <MessageList
        messages={chatHook.messages}
        loading={chatHook.loading}
        currentUserId={currentUser?.id}
        conversation={conversation}
        onReply={setReplyTo}
        onDelete={chatHook.deleteMessage}
        onMarkAsRead={chatHook.markAsRead}
      />

      <MessageInput
        onSend={chatHook.sendMessage}
        onSendImage={chatHook.sendImage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        presenceHook={presenceHook}
        conversationId={conversationId}
      />

      {showGroupInfo && conversation?.type === 'group' && (
        <GroupInfoPanel
          conversation={conversation}
          convHook={convHook}
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </div>
  );
};

export default ChatPanel;
