import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import SidebarHeader from './SidebarHeader';
import SearchBar from './SearchBar';
import StoriesRow from './StoriesRow';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';
import NewGroupModal from './NewGroupModal';
import SettingsPanel from './SettingsPanel';

/**
 * Sidebar — left panel with tabs, search (conversations + global users), stories, chat list.
 */
const Sidebar = ({
  className = '', conversations, loading, activeConversationId,
  onSelectConversation, presenceHook, storiesHook, convHook, profile,
}) => {
  const { currentUser } = useAuth();
  const [view, setView] = useState('chats');
  const [activeTab, setActiveTab] = useState('chats');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global user search for "Search → Click → Open Chat" flow
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [creatingDM, setCreatingDM] = useState(null); // userId being created
  const searchTimerRef = useRef(null);

  // Debounced search handler — searches conversations AND users
  const handleSearch = useCallback((value) => {
    clearTimeout(searchTimerRef.current);

    if (!value || value.length < 2) {
      setSearchQuery('');
      setUserResults([]);
      setSearchingUsers(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setSearchQuery(value);

      // Also search global users
      setSearchingUsers(true);
      const searchTerm = value.toLowerCase().replace('@', '');
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_online')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .neq('id', currentUser?.id || '')
        .limit(10);

      setUserResults(data || []);
      setSearchingUsers(false);
    }, 300);
  }, [currentUser?.id]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(searchTimerRef.current);
  }, []);

  // Handle clicking a user search result → create/open DM
  const handleUserClick = async (user) => {
    if (creatingDM) return;
    setCreatingDM(user.id);

    try {
      const conv = await convHook.createDM(user.id);
      if (conv) {
        onSelectConversation(conv.id);
        setSearchQuery('');
        setUserResults([]);
      }
    } catch (err) {
      console.error('Failed to create DM:', err);
    }
    setCreatingDM(null);
  };

  // Filter conversations by search and active tab
  const filteredConversations = conversations.filter(conv => {
    // Tab filter
    if (activeTab === 'groups' && conv.type !== 'group') return false;
    if (activeTab === 'chats' && conv.type !== 'direct') return false;

    // Search filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (conv.type === 'direct') {
      return conv.dmPartner?.display_name?.toLowerCase().includes(q)
        || conv.dmPartner?.username?.toLowerCase().includes(q);
    }
    return conv.name?.toLowerCase().includes(q);
  });

  // Filter out users who already have a conversation shown
  const existingPartnerIds = new Set(
    conversations.filter(c => c.type === 'direct' && c.dmPartner).map(c => c.dmPartner.id)
  );
  const newUserResults = searchQuery
    ? userResults.filter(u => !existingPartnerIds.has(u.id))
    : [];

  if (view === 'settings') {
    return (
      <div className={`sidebar ${className}`}>
        <SettingsPanel onBack={() => setView('chats')} />
      </div>
    );
  }

  // Skeleton loader for chat list
  const renderSkeletons = () => (
    Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="skeleton-chat-item">
        <div className="skeleton skeleton-circle skeleton-chat-avatar" />
        <div className="skeleton-chat-lines" style={{ flex: 1 }}>
          <div className="skeleton skeleton-text medium" />
          <div className="skeleton skeleton-text short" />
        </div>
      </div>
    ))
  );

  return (
    <div className={`sidebar ${className}`}>
      <SidebarHeader
        profile={profile}
        onNewChat={() => setShowNewChat(true)}
        onNewGroup={() => setShowNewGroup(true)}
        onSettings={() => setView('settings')}
      />

      <SearchBar onSearch={handleSearch} />

      {/* Tab Switcher */}
      <div className="tab-switcher">
        {['chats', 'groups', 'stories'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'stories' ? (
        <div className="chat-list">
          <StoriesRow storiesHook={storiesHook} />
        </div>
      ) : (
        <>
          {activeTab === 'chats' && <StoriesRow storiesHook={storiesHook} compact />}
          <div className="chat-list">
            {loading ? renderSkeletons() : (
              <>
                {/* Existing conversation results */}
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(conv => (
                    <ChatListItem
                      key={conv.id}
                      conversation={conv}
                      active={conv.id === activeConversationId}
                      onClick={() => onSelectConversation(conv.id)}
                      presenceHook={presenceHook}
                    />
                  ))
                ) : !searchQuery ? (
                  <div className="flex-center" style={{ padding: '40px', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '40px', opacity: 0.5 }}>💬</div>
                    <span className="text-muted" style={{ fontSize: '14px' }}>
                      {activeTab === 'groups' ? 'No groups yet' : 'No conversations yet'}
                    </span>
                    <span
                      className="text-accent"
                      style={{ cursor: 'pointer', fontSize: '14px' }}
                      onClick={() => activeTab === 'groups' ? setShowNewGroup(true) : setShowNewChat(true)}
                    >
                      {activeTab === 'groups' ? 'Create a group' : 'Start a new chat'}
                    </span>
                  </div>
                ) : null}

                {/* Global user search results (users you haven't chatted with) */}
                {searchQuery && newUserResults.length > 0 && (
                  <>
                    <div style={{
                      padding: '8px 16px', fontSize: '11px', fontWeight: 600,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      Start a new chat
                    </div>
                    {newUserResults.map(user => (
                      <div
                        key={user.id}
                        className="chat-list-item"
                        onClick={() => handleUserClick(user)}
                        style={{ opacity: creatingDM === user.id ? 0.5 : 1, cursor: 'pointer' }}
                      >
                        <div
                          className="chat-list-avatar"
                          style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
                        >
                          {!user.avatar_url && (
                            <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '16px', color: 'var(--text-secondary)' }}>
                              {user.display_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="chat-list-info">
                          <div className="chat-list-name">{user.display_name || user.username}</div>
                          <div className="chat-list-preview">@{user.username}</div>
                        </div>
                        {user.is_online && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--online-green)', flexShrink: 0 }} />
                        )}
                        {creatingDM === user.id && (
                          <div className="btn-spinner" style={{ width: '16px', height: '16px' }} />
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* No results at all */}
                {searchQuery && filteredConversations.length === 0 && newUserResults.length === 0 && !searchingUsers && (
                  <div className="flex-center" style={{ padding: '40px', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '40px', opacity: 0.5 }}>🔍</div>
                    <span className="text-muted" style={{ fontSize: '14px' }}>No results for "{searchQuery}"</span>
                  </div>
                )}

                {searchingUsers && (
                  <div className="flex-center" style={{ padding: '12px' }}>
                    <div className="splash-spinner" style={{ width: '20px', height: '20px' }} />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Bottom action bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', padding: '10px 16px',
        borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)',
      }}>
        <button className="icon-btn" onClick={() => setShowNewChat(true)} title="New Chat">💬</button>
        <button className="icon-btn" onClick={() => setShowNewGroup(true)} title="New Group">👥</button>
        <button className="icon-btn" onClick={() => setView('settings')} title="Settings">⚙️</button>
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
