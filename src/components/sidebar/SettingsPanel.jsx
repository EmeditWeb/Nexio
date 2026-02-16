import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

/**
 * SettingsPanel — profile settings, edit profile, logout, delete account.
 */
const SettingsPanel = ({ onBack }) => {
  const { currentUser, profile, logout, refreshProfile, deleteAccount } = useAuth();
  const { updateProfile } = useProfile(currentUser?.id);

  const [editing, setEditing] = useState(null); // 'name' | 'about' | null
  const [editValue, setEditValue] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const fileRef = useRef();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await updateProfile({ avatarFile: file });
      await refreshProfile();
    }
  };

  const handleSave = async () => {
    if (editing === 'name') {
      await updateProfile({ display_name: editValue });
    } else if (editing === 'about') {
      await updateProfile({ about: editValue });
    }
    await refreshProfile();
    setEditing(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h3>Settings</h3>
      </div>

      {/* Profile avatar */}
      <div className="settings-profile">
        <div
          className="settings-avatar"
          style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : {}}
          onClick={() => fileRef.current?.click()}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />
      </div>

      {/* Username (readonly) */}
      <div className="settings-field">
        <div className="settings-field-label">Username</div>
        <div className="settings-field-value">@{profile?.username}</div>
      </div>

      {/* Display Name */}
      <div className="settings-field" style={{ cursor: 'pointer' }} onClick={() => {
        if (editing !== 'name') {
          setEditing('name');
          setEditValue(profile?.display_name || '');
        }
      }}>
        <div className="settings-field-label">Name</div>
        {editing === 'name' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="modal-input"
              style={{ marginBottom: 0 }}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button className="modal-btn modal-btn-primary" onClick={handleSave}>✓</button>
          </div>
        ) : (
          <div className="settings-field-value">{profile?.display_name} ✏️</div>
        )}
      </div>

      {/* About */}
      <div className="settings-field" style={{ cursor: 'pointer' }} onClick={() => {
        if (editing !== 'about') {
          setEditing('about');
          setEditValue(profile?.about || '');
        }
      }}>
        <div className="settings-field-label">About</div>
        {editing === 'about' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="modal-input"
              style={{ marginBottom: 0 }}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button className="modal-btn modal-btn-primary" onClick={handleSave}>✓</button>
          </div>
        ) : (
          <div className="settings-field-value">{profile?.about || 'Add about'} ✏️</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 'auto' }}>
        <div className="settings-action" onClick={handleLogout}>
          🚪 Log out
        </div>
        <div className="settings-action danger" onClick={() => setShowConfirmDelete(true)}>
          🗑️ Delete Account
        </div>
      </div>

      {/* Delete confirmation */}
      {showConfirmDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '12px' }}>Delete Account?</h3>
              <p className="text-muted" style={{ marginBottom: '20px' }}>
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="modal-btn modal-btn-secondary" onClick={() => setShowConfirmDelete(false)}>
                  Cancel
                </button>
                <button className="modal-btn modal-btn-danger" onClick={handleDeleteAccount}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
