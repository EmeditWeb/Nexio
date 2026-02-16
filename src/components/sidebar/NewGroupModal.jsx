import { useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { SEARCH_MIN_CHARS, SEARCH_RESULTS_LIMIT, GROUP_NAME_MIN_LENGTH, GROUP_MAX_MEMBERS } from '../../utils/constants';

/**
 * NewGroupModal — create a group with name, description, and selected members.
 */
const NewGroupModal = ({ onClose, onCreated, convHook }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('details');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (val) => {
    setQuery(val);
    if (val.length < SEARCH_MIN_CHARS) { setResults([]); return; }

    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.%${val}%,display_name.ilike.%${val}%`)
      .neq('id', currentUser.id)
      .limit(SEARCH_RESULTS_LIMIT);

    setResults(data || []);
    setSearching(false);
  }, [currentUser?.id]);

  const toggleMember = (user) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === user.id);
      if (exists) return prev.filter(m => m.id !== user.id);
      if (prev.length >= GROUP_MAX_MEMBERS - 1) {
        setError(`Maximum ${GROUP_MAX_MEMBERS} members per group`);
        return prev;
      }
      return [...prev, user];
    });
  };

  const handleCreate = async () => {
    if (groupName.trim().length < GROUP_NAME_MIN_LENGTH) {
      setError(`Group name must be at least ${GROUP_NAME_MIN_LENGTH} characters`);
      return;
    }
    if (selectedMembers.length === 0) {
      setError('Add at least one member');
      return;
    }

    setCreating(true);
    const conv = await convHook.createGroup({
      name: groupName.trim(),
      description: groupDesc.trim(),
      memberIds: selectedMembers.map(m => m.id),
    });
    if (conv) onCreated(conv.id);
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step === 'details' ? 'New Group' : 'Add Members'}</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {step === 'details' ? (
            <>
              <input
                className="modal-input"
                placeholder="Group name (required)"
                value={groupName}
                onChange={e => { setGroupName(e.target.value); setError(''); }}
                autoFocus
              />
              <input
                className="modal-input"
                placeholder="Description (optional)"
                value={groupDesc}
                onChange={e => setGroupDesc(e.target.value)}
              />
              {error && <div className="error-text">{error}</div>}
              <button
                className="modal-btn modal-btn-primary w-full"
                onClick={() => {
                  if (groupName.trim().length < GROUP_NAME_MIN_LENGTH) {
                    setError(`Group name must be at least ${GROUP_NAME_MIN_LENGTH} characters`);
                    return;
                  }
                  setStep('members');
                }}
              >
                Next — Add Members
              </button>
            </>
          ) : (
            <>
              <input
                className="modal-input"
                placeholder="Search users to add..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />

              {/* Selected members chips */}
              {selectedMembers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {selectedMembers.map(m => (
                    <span
                      key={m.id}
                      style={{
                        background: 'var(--accent-dim)', color: 'var(--accent)',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                      onClick={() => toggleMember(m)}
                    >
                      {m.display_name || m.username} ✕
                    </span>
                  ))}
                </div>
              )}

              {searching && (
                <div className="flex-center" style={{ padding: '20px' }}>
                  <div className="splash-spinner" style={{ width: '24px', height: '24px' }} />
                </div>
              )}

              {results.map(user => {
                const isSelected = selectedMembers.some(m => m.id === user.id);
                return (
                  <div key={user.id} className="modal-user-item" onClick={() => toggleMember(user)}>
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
                    {isSelected && <span className="modal-user-check">✓</span>}
                  </div>
                );
              })}

              {error && <div className="error-text">{error}</div>}

              <button
                className="modal-btn modal-btn-primary w-full"
                onClick={handleCreate}
                disabled={creating || selectedMembers.length === 0}
                style={{ marginTop: '12px' }}
              >
                {creating ? <div className="btn-spinner" /> : `Create Group (${selectedMembers.length + 1} members)`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
