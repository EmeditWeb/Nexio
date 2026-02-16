import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

/**
 * ChatPanel — right panel showing active conversation or empty state.
 * Fixes:
 * - Manages replyTo state
 * - Passes replyTo state to MessageInput
 * - Receives onReply from MessageList
 */
const ChatPanel = ({ className = '', conversation, conversationId, presenceHook, convHook, onBack }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const chatHook = useChat(conversationId, userId);

  const [replyTo, setReplyTo] = useState(null);

  if (!conversationId) {
    return (
      <div className={`chat-panel ${className}`}>
        <div className="chat-empty">
          <div className="chat-empty-icon">💬</div>
          <h2>Welcome to Nexio</h2>
          <p>Select a conversation to start chatting, or create a new one from the sidebar.</p>
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
        convHook={convHook}
      />
      <MessageList
        messages={chatHook.messages}
        loading={chatHook.loading}
        loadingMore={chatHook.loadingMore}
        hasMore={chatHook.hasMore}
        onLoadMore={chatHook.loadMore}
        currentUserId={userId}
        conversationId={conversationId}
        chatHook={chatHook}
        onReply={(msg) => setReplyTo(msg)}
      />
      <MessageInput
        conversationId={conversationId}
        onSend={chatHook.sendMessage}
        sending={chatHook.sending}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
      />
    </div>
  );
};

export default ChatPanel;
