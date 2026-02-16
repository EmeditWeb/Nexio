import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

/**
 * GroupInfoPanel — slide-in panel showing group details, members, and admin controls.
 */
const GroupInfoPanel = ({ conversation, convHook, onClose }) => {
  const { currentUser } = useAuth();
  const { searchUsers } = useProfile(currentUser?.id);
  const conv = conversation;

  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [groupName, setGroupName] = useState(conv?.name || '');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const members = conv?.conversation_members || [];
  const isAdmin = conv?.isAdmin;

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const users = await searchUsers(q);
    const memberIds = new Set(members.map(m => m.user_id));
    setSearchResults(users.filter(u => !memberIds.has(u.id)));
  }, [searchUsers, members]);

  const handleAddMember = async (userId) => {
    await convHook.addMember(conv.id, userId);
    setShowAddMember(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMember = async (userId) => {
    await convHook.removeMember(conv.id, userId);
  };

  const handleUpdateName = async () => {
    if (groupName.trim() && groupName !== conv.name) {
      await convHook.updateGroup(conv.id, { name: groupName.trim() });
    }
    setEditingName(false);
  };

  const handleLeave = async () => {
    await convHook.leaveGroup(conv.id);
    onClose();
  };

  const handleDelete = async () => {
    await convHook.deleteGroup(conv.id);
    onClose();
  };

  return (
    <div className="group-info-panel">
      <div className="group-info-header">
        <button className="icon-btn" onClick={onClose}>✕</button>
        <h3>Group Info</h3>
      </div>

      {/* Group avatar */}
      <div
        className="group-info-avatar"
        style={conv?.avatar_url ? { backgroundImage: `url(${conv.avatar_url})` } : {}}
      >
        {!conv?.avatar_url && (
          <div className="flex-center" style={{ width: '100%', height: '100%', fontSize: '36px', color: 'var(--text-secondary)' }}>
            👥
          </div>
        )}
      </div>

      {/* Group name */}
      <div className="group-info-name">
        {editingName ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <input
              className="modal-input"
              style={{ marginBottom: 0, maxWidth: '200px' }}
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUpdateName()}
              autoFocus
            />
            <button className="modal-btn modal-btn-primary" onClick={handleUpdateName}>✓</button>
          </div>
        ) : (
          <span onClick={() => isAdmin && setEditingName(true)} style={isAdmin ? { cursor: 'pointer' } : {}}>
            {conv?.name} {isAdmin && '✏️'}
          </span>
        )}
      </div>

      {/* Description */}
      {conv?.description && (
        <div style={{ textAlign: 'center', padding: '0 16px 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          {conv.description}
        </div>
      )}

      <div className="group-info-members-count">
        {members.length} members
      </div>

      {/* Members section */}
      <div className="group-info-section">
        <div className="group-info-section-title">Members</div>

        {isAdmin && (
          <div
            className="member-item"
            style={{ cursor: 'pointer', color: 'var(--accent)' }}
            onClick={() => setShowAddMember(true)}
          >
            <div className="member-avatar flex-center" style={{ fontSize: '20px' }}>➕</div>
            <div className="member-name" style={{ color: 'var(--accent)' }}>Add member</div>
          </div>
        )}

        {members.map(member => (
          <div className="member-item" key={member.user_id}>
            <div
              className="member-avatar"
              style={member.profiles?.avatar_url ? { backgroundImage: `url(${member.profiles.avatar_url})` } : {}}
            />
            <div className="member-name">
              {member.profiles?.display_name || member.profiles?.username || 'Unknown'}
              {member.user_id === currentUser?.id && (
                <span className="text-muted" style={{ fontSize: '13px' }}> (You)</span>
              )}
            </div>
            {member.is_admin && <span className="member-badge">Admin</span>}
            {isAdmin && member.user_id !== currentUser?.id && (
              <button
                className="icon-btn"
                style={{ width: '32px', height: '32px', fontSize: '14px' }}
                onClick={() => handleRemoveMember(member.user_id)}
                title="Remove member"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="group-info-section">
        <div className="settings-action danger" onClick={() => setConfirmLeave(true)}>
          🚪 Leave Group
        </div>
        {isAdmin && (
          <div className="settings-action danger" onClick={() => setConfirmDelete(true)}>
            🗑️ Delete Group
          </div>
        )}
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="icon-btn" onClick={() => setShowAddMember(false)}>←</button>
              <h3>Add Member</h3>
            </div>
            <div className="modal-body">
              <input
                className="modal-input"
                placeholder="Search by @username..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />
              {searchResults.map(user => (
                <div key={user.id} className="user-search-item" onClick={() => handleAddMember(user.id)}>
                  <div className="user-search-avatar"
                    style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}} />
                  <div className="user-search-info">
                    <div className="user-search-name">{user.display_name}</div>
                    <div className="user-search-username">@{user.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm leave */}
      {confirmLeave && (
        <div className="modal-overlay" onClick={() => setConfirmLeave(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '12px' }}>Leave Group?</h3>
              <p className="text-muted mb-16">You won't be able to send or receive messages in this group.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="modal-btn modal-btn-secondary" onClick={() => setConfirmLeave(false)}>Cancel</button>
                <button className="modal-btn modal-btn-danger" onClick={handleLeave}>Leave</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '12px' }}>Delete Group?</h3>
              <p className="text-muted mb-16">This will permanently delete this group and all its messages.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="modal-btn modal-btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className="modal-btn modal-btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoPanel;
