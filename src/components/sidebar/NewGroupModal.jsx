import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

/**
 * NewGroupModal — create a group chat with name, description, avatar, and members.
 */
const NewGroupModal = ({ onClose, onCreated, convHook }) => {
  const { currentUser } = useAuth();
  const { searchUsers } = useProfile(currentUser?.id);

  const [step, setStep] = useState(1); // 1: name/info, 2: add members
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileRef = useRef();

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setLoading(true);
    const users = await searchUsers(q);
    setSearchResults(users.filter(u => !selectedMembers.some(m => m.id === u.id)));
    setLoading(false);
  }, [searchUsers, selectedMembers]);

  const addMember = (user) => {
    setSelectedMembers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u.id !== user.id));
    setSearchQuery('');
  };

  const removeMember = (userId) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== userId));
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);

    const conv = await convHook.createGroup({
      name: name.trim(),
      description: description.trim(),
      avatarFile,
      memberIds: selectedMembers.map(m => m.id),
    });

    if (conv) {
      onCreated(conv.id);
    }
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="icon-btn" onClick={step === 2 ? () => setStep(1) : onClose}>←</button>
          <h3>{step === 1 ? 'New Group' : 'Add Members'}</h3>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <>
              <div className="flex-center mb-16">
                <div
                  className="profile-setup-avatar"
                  style={{
                    width: '80px', height: '80px',
                    ...(avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {}),
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  {!avatarPreview && '📷'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              <input
                className="modal-input"
                placeholder="Group Name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
                autoFocus
              />
              <textarea
                className="modal-textarea"
                placeholder="Group Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={200}
                rows={2}
              />
            </>
          ) : (
            <>
              {/* Selected members chips */}
              {selectedMembers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {selectedMembers.map(m => (
                    <span
                      key={m.id}
                      style={{
                        background: 'var(--accent-dim)',
                        color: 'var(--accent)',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {m.display_name}
                      <span style={{ cursor: 'pointer' }} onClick={() => removeMember(m.id)}>✕</span>
                    </span>
                  ))}
                </div>
              )}

              <input
                className="modal-input"
                placeholder="Search by @username..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />

              {loading && <p className="text-muted" style={{ textAlign: 'center' }}>Searching...</p>}

              {searchResults.map(user => (
                <div key={user.id} className="user-search-item" onClick={() => addMember(user)}>
                  <div
                    className="user-search-avatar"
                    style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
                  />
                  <div className="user-search-info">
                    <div className="user-search-name">{user.display_name}</div>
                    <div className="user-search-username">@{user.username}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="modal-footer">
          {step === 1 ? (
            <button
              className="modal-btn modal-btn-primary"
              onClick={() => setStep(2)}
              disabled={!name.trim()}
            >
              Next
            </button>
          ) : (
            <button
              className="modal-btn modal-btn-primary"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Group'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
