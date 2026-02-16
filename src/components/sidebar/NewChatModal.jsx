import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

/**
 * NewChatModal — search users by @username and start a DM.
 */
const NewChatModal = ({ onClose, onCreated, convHook }) => {
  const { currentUser } = useAuth();
  const { searchUsers } = useProfile(currentUser?.id);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = useCallback(async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }

    setLoading(true);
    const users = await searchUsers(q);
    setResults(users);
    setLoading(false);
  }, [searchUsers]);

  const handleSelect = async (user) => {
    setCreating(true);
    const conv = await convHook.createDM(user.id);
    if (conv) {
      onCreated(conv.id);
    }
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="icon-btn" onClick={onClose}>←</button>
          <h3>New Chat</h3>
        </div>

        <div className="modal-body">
          <input
            className="modal-input"
            type="text"
            placeholder="Search by @username..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />

          {loading && <p className="text-muted" style={{ textAlign: 'center', padding: '12px' }}>Searching...</p>}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="text-muted" style={{ textAlign: 'center', padding: '12px' }}>No users found</p>
          )}

          {results.map(user => (
            <div
              key={user.id}
              className="user-search-item"
              onClick={() => !creating && handleSelect(user)}
              style={creating ? { opacity: 0.5 } : {}}
            >
              <div
                className="user-search-avatar"
                style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
              />
              <div className="user-search-info">
                <div className="user-search-name">{user.display_name}</div>
                <div className="user-search-username">@{user.username}</div>
              </div>
              {user.is_online && (
                <span className="text-accent" style={{ fontSize: '12px' }}>online</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
