/**
 * SidebarHeader — user avatar, name, @username at top of sidebar.
 */
const SidebarHeader = ({ profile, onNewChat, onNewGroup, onSettings }) => {
    return (
        <div className="sidebar-header">
            <div className="sidebar-header-left" onClick={onSettings}>
                <div
                    className="sidebar-header-avatar"
                    style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : {}}
                >
                    {!profile?.avatar_url && (
                        <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '16px', color: 'var(--text-secondary)' }}>
                            {profile?.display_name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                <div className="sidebar-header-info">
                    <div className="sidebar-header-name">{profile?.display_name || 'User'}</div>
                    <div className="sidebar-header-username">@{profile?.username || 'user'}</div>
                </div>
            </div>
            <div className="sidebar-header-actions">
                <button className="icon-btn" onClick={onNewChat} title="New Chat">✏️</button>
            </div>
        </div>
    );
};

export default SidebarHeader;
