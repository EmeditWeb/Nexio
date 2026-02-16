import { useAuth } from '../../contexts/AuthContext';

/**
 * SidebarHeader — user avatar + action buttons (new chat, new group, settings).
 */
const SidebarHeader = ({ onNewChat, onNewGroup, onSettings }) => {
    const { profile } = useAuth();

    return (
        <div className="sidebar-header">
            <div className="sidebar-header-left" onClick={onSettings}>
                <div
                    className="sidebar-header-avatar"
                    style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : {}}
                />
                <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    {profile?.display_name || 'User'}
                </span>
            </div>

            <div className="sidebar-header-actions">
                <button className="icon-btn" onClick={onNewGroup} title="New Group">
                    👥
                </button>
                <button className="icon-btn" onClick={onNewChat} title="New Chat">
                    💬
                </button>
                <button className="icon-btn" onClick={onSettings} title="Settings">
                    ⚙️
                </button>
            </div>
        </div>
    );
};

export default SidebarHeader;
