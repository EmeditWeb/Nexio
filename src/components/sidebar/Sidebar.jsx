import { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SearchBar from './SearchBar';
import StoriesRow from './StoriesRow';
import ChatList from './ChatList';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';
import NewGroupModal from './NewGroupModal';
import SettingsPanel from './SettingsPanel';

/**
 * Sidebar — left panel containing header, search, stories, and chat list.
 */
const Sidebar = ({
  className = '',
  conversations,
  loading,
  activeConversationId,
  onSelectConversation,
  presenceHook,
  storiesHook,
  convHook,
}) => {
  const [view, setView] = useState('chats'); // 'chats' | 'settings'
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (conv.type === 'direct') {
      return conv.dmPartner?.display_name?.toLowerCase().includes(q)
        || conv.dmPartner?.username?.toLowerCase().includes(q);
    }
    return conv.name?.toLowerCase().includes(q);
  });

  if (view === 'settings') {
    return (
      <div className={`sidebar ${className}`}>
        <SettingsPanel onBack={() => setView('chats')} />
      </div>
    );
  }

  return (
    <div className={`sidebar ${className}`}>
      <SidebarHeader
        onNewChat={() => setShowNewChat(true)}
        onNewGroup={() => setShowNewGroup(true)}
        onSettings={() => setView('settings')}
      />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <StoriesRow storiesHook={storiesHook} />

      <div className="chat-list">
        {loading ? (
          <div className="flex-center" style={{ padding: '40px' }}>
            <span className="text-muted">Loading chats...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex-center" style={{ padding: '40px', flexDirection: 'column', gap: '8px' }}>
            <span className="text-muted">
              {searchQuery ? 'No chats found' : 'No conversations yet'}
            </span>
            {!searchQuery && (
              <span
                className="text-accent"
                style={{ cursor: 'pointer', fontSize: '14px' }}
                onClick={() => setShowNewChat(true)}
              >
                Start a new chat
              </span>
            )}
          </div>
        ) : (
          filteredConversations.map(conv => (
            <ChatListItem
              key={conv.id}
              conversation={conv}
              active={conv.id === activeConversationId}
              onClick={() => onSelectConversation(conv.id)}
              presenceHook={presenceHook}
            />
          ))
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={(convId) => { setShowNewChat(false); onSelectConversation(convId); }}
          convHook={convHook}
        />
      )}

      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onCreated={(convId) => { setShowNewGroup(false); onSelectConversation(convId); }}
          convHook={convHook}
        />
      )}
    </div>
  );
};

export default Sidebar;
