import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUpload } from '../../hooks/useUpload';
import { supabase } from '../../supabaseClient';

/**
 * SettingsPanel — profile editing, theme toggle, and account settings.
 */
const SettingsPanel = ({ onBack }) => {
  const { currentUser, profile, logout, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { uploadAvatar, uploading } = useUpload();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [about, setAbout] = useState(profile?.about || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const result = await uploadAvatar(file, currentUser.id);
    if (result?.url) {
      // Update the profile in the database directly
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', currentUser.id);

      if (dbErr) {
        setError('Upload succeeded but failed to save to profile');
      } else {
        // Refresh auth context profile so the UI updates
        await refreshProfile();
        setError('');
      }
    } else if (result?.error) {
      setError(result.error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), about: about.trim() })
      .eq('id', currentUser.id);

    if (dbErr) {
      setError('Failed to save profile');
    } else {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h3>Settings</h3>
      </div>

      {/* Profile section */}
      <div className="settings-profile">
        <div
          className="settings-avatar"
          style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : {}}
          onClick={() => fileInputRef.current?.click()}
        >
          {!profile?.avatar_url && (
            <div className="flex-center" style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '32px', color: 'var(--text-secondary)' }}>
              {profile?.display_name?.[0]?.toUpperCase() || '📷'}
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={handleAvatarUpload}
        />
        {uploading && <span className="text-muted" style={{ fontSize: '12px' }}>Uploading...</span>}
        {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
        <div style={{ fontWeight: 600, fontSize: '18px' }}>{profile?.display_name || 'User'}</div>
        <div className="text-secondary" style={{ fontSize: '14px' }}>@{profile?.username || 'user'}</div>
      </div>

      {/* Fields */}
      {editing ? (
        <div style={{ padding: '16px 20px' }}>
          <label className="settings-field-label">Display Name</label>
          <input className="modal-input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          <label className="settings-field-label">About</label>
          <input className="modal-input" value={about} onChange={e => setAbout(e.target.value)} placeholder="Tell people about yourself" />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="modal-btn modal-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <div className="btn-spinner" /> : 'Save'}
            </button>
            <button className="modal-btn modal-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="settings-field">
            <div className="settings-field-label">Display Name</div>
            <div className="settings-field-value">{profile?.display_name || '—'}</div>
          </div>
          <div className="settings-field">
            <div className="settings-field-label">Username</div>
            <div className="settings-field-value">@{profile?.username || '—'}</div>
          </div>
          <div className="settings-field">
            <div className="settings-field-label">About</div>
            <div className="settings-field-value">{profile?.about || 'No bio yet'}</div>
          </div>
          <div className="settings-action" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </div>
        </>
      )}

      {/* Theme toggle */}
      <div className="theme-toggle">
        <span className="theme-toggle-label">🌙 Dark Mode</span>
        <label className="toggle-switch">
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Actions */}
      <div className="settings-action danger" onClick={handleLogout}>
        🚪 Logout
      </div>
    </div>
  );
};

export default SettingsPanel;
