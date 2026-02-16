import ChatListItem from './ChatListItem';

/**
 * ChatList — list wrapper for ChatListItem (for future extensibility).
 */
const ChatList = ({ conversations, activeConversationId, onSelectConversation, presenceHook }) => {
  return (
    <div className="chat-list">
      {conversations.map(conv => (
        <ChatListItem
          key={conv.id}
          conversation={conv}
          active={conv.id === activeConversationId}
          onClick={() => onSelectConversation(conv.id)}
          presenceHook={presenceHook}
        />
      ))}
    </div>
  );
};

export default ChatList;
