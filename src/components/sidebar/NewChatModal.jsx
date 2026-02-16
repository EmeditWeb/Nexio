import { useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { SEARCH_MIN_CHARS, SEARCH_RESULTS_LIMIT } from '../../utils/constants';

/**
 * NewChatModal — search users and start a DM conversation.
 */
const NewChatModal = ({ onClose, onCreated, convHook }) => {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = useCallback(async (val) => {
    setQuery(val);
    if (val.length < SEARCH_MIN_CHARS) { setResults([]); return; }

    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_online')
      .or(`username.ilike.%${val}%,display_name.ilike.%${val}%`)
      .neq('id', currentUser.id)
      .limit(SEARCH_RESULTS_LIMIT);

    setResults(data || []);
    setSearching(false);
  }, [currentUser?.id]);

  const handleSelect = async (user) => {
    setCreating(true);
    const conv = await convHook.createDM(user.id);
    if (conv) onCreated(conv.id);
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Chat</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <input
            className="modal-input"
            placeholder="Search by username or name..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
            aria-label="Search users"
          />

          {searching && (
            <div className="flex-center" style={{ padding: '20px' }}>
              <div className="splash-spinner" style={{ width: '24px', height: '24px' }} />
            </div>
          )}

          {!searching && query.length >= SEARCH_MIN_CHARS && results.length === 0 && (
            <div className="flex-center" style={{ padding: '20px', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>🔍</span>
              <span className="text-muted" style={{ fontSize: '14px' }}>No users found for "{query}"</span>
            </div>
          )}

          {results.map(user => (
            <div
              key={user.id}
              className="modal-user-item"
              onClick={() => !creating && handleSelect(user)}
              style={{ opacity: creating ? 0.5 : 1 }}
            >
              <div
                className="modal-user-avatar"
                style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
              >
                {!user.avatar_url && (
                  <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '16px', color: 'var(--text-secondary)' }}>
                    {user.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="modal-user-info">
                <div className="modal-user-name">{user.display_name || user.username}</div>
                <div className="modal-user-username">@{user.username}</div>
              </div>
              {user.is_online && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--online-green)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
