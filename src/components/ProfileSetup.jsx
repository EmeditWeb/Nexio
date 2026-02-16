import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { useUpload } from '../hooks/useUpload';

/**
 * ProfileSetup — first-time user flow for username, display name, and avatar.
 */
const ProfileSetup = () => {
  const { currentUser } = useAuth();
  const { uploadAvatar, uploading, progress, error: uploadError } = useUpload();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    setAvatarPreview(URL.createObjectURL(file));
    const result = await uploadAvatar(file, currentUser.id);
    if (result?.url) {
      setAvatarUrl(result.url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Username is required'); return; }
    if (username.trim().length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!displayName.trim()) { setError('Display name is required'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username can only contain letters, numbers, and underscores'); return; }

    setLoading(true);

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .neq('id', currentUser.id)
      .maybeSingle();

    if (existing) { setError('Username already taken'); setLoading(false); return; }

    const { error: updateErr } = await supabase
      .from('profiles')
      .upsert({
        id: currentUser.id,
        username: username.toLowerCase(),
        display_name: displayName.trim(),
        avatar_url: avatarUrl,
        is_online: true,
        last_seen: new Date().toISOString(),
      });

    if (updateErr) {
      setError('Failed to save profile');
      setLoading(false);
      return;
    }

    // Force a refresh
    window.location.href = '/';
  };

  return (
    <div className="profile-setup">
      <div className="profile-setup-card">
        <h1>Set Up Your Profile</h1>
        <p>Choose a username and add a photo to get started.</p>

        <div className="profile-setup-avatar-wrapper">
          <div
            className="profile-setup-avatar"
            style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {}}
            onClick={() => fileInputRef.current?.click()}
          >
            {!avatarPreview && '📷'}
          </div>
        </div>

        {uploading && (
          <div className="upload-progress" style={{ padding: '0 0 12px' }}>
            <div className="upload-progress-bar">
              <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={handleAvatarSelect}
        />

        {error && <div className="error-text">{error}</div>}
        {uploadError && <div className="error-text">{uploadError}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder="Username (e.g., johndoe)"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            aria-label="Username"
          />
          <input
            className="login-input"
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            aria-label="Display name"
          />
          <button
            className="login-btn login-btn-primary"
            type="submit"
            disabled={loading || uploading}
          >
            {loading ? <div className="btn-spinner" /> : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
