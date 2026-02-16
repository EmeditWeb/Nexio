import { useAuth } from '../../contexts/AuthContext';

/**
 * GroupInfoPanel — overlay showing group details, members, and management actions.
 */
const GroupInfoPanel = ({ conversation, onClose, convHook }) => {
  const { currentUser } = useAuth();
  const members = conversation?.conversation_members || [];
  const isAdmin = conversation?.isAdmin;

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove this member from the group?')) {
      await convHook.removeMember(conversation.id, memberId);
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await convHook.leaveGroup(conversation.id);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this group for everyone? This cannot be undone.')) {
      await convHook.deleteGroup(conversation.id);
      onClose();
    }
  };

  return (
    <div className="group-info-overlay" onClick={onClose}>
      <div className="group-info-panel" onClick={e => e.stopPropagation()}>
        <div className="group-info-header">
          <div
            className="group-info-avatar"
            style={conversation.avatar_url ? { backgroundImage: `url(${conversation.avatar_url})` } : {}}
          >
            {!conversation.avatar_url && (
              <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '28px', color: 'var(--text-secondary)' }}>👥</div>
            )}
          </div>
          <div className="group-info-name">{conversation.name || 'Group'}</div>
          {conversation.description && (
            <div className="group-info-desc">{conversation.description}</div>
          )}
          <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px' }}>✕</button>
        </div>

        <div className="group-info-section">
          <div className="group-info-section-title">Members ({members.length})</div>
          {members.map(member => {
            const profile = member.profiles;
            return (
              <div key={member.user_id} className="group-member-item">
                <div
                  className="group-member-avatar"
                  style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : {}}
                >
                  {!profile?.avatar_url && (
                    <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="group-member-name">
                    {profile?.display_name || profile?.username || 'Unknown'}
                    {member.user_id === currentUser?.id && ' (You)'}
                  </div>
                </div>
                {member.is_admin && <span className="group-member-role">Admin</span>}
                {isAdmin && member.user_id !== currentUser?.id && (
                  <button
                    className="icon-btn"
                    onClick={() => handleRemoveMember(member.user_id)}
                    title="Remove member"
                    style={{ fontSize: '14px', color: 'var(--danger)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="settings-action danger" onClick={handleLeave}>🚪 Leave Group</div>
          {isAdmin && <div className="settings-action danger" onClick={handleDelete}>🗑️ Delete Group</div>}
        </div>
      </div>
    </div>
  );
};

export default GroupInfoPanel;
