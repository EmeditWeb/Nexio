import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

/**
 * ProfileSetup — first-time profile creation. Shown after signup / OAuth.
 */
const ProfileSetup = () => {
  const { currentUser, refreshProfile, profile } = useAuth();
  const { setupProfile } = useProfile(currentUser?.id);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.user_name || ''
  );
  const [about, setAbout] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    currentUser?.user_metadata?.avatar_url || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  // If profile already exists, redirect to main
  if (profile) {
    navigate('/');
    return null;
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Username is required'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username can only contain letters, numbers, and underscores'); return; }
    if (!displayName.trim()) { setError('Display name is required'); return; }

    setLoading(true);
    const result = await setupProfile({
      username: username.trim(),
      displayName: displayName.trim(),
      avatarFile,
      about: about.trim(),
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      await refreshProfile();
      navigate('/');
    }
  };

  return (
    <div className="profile-setup">
      <div className="profile-setup-card">
        <h1>Set Up Your Profile</h1>
        <p>Let others know who you are</p>

        <form onSubmit={handleSubmit}>
          <div className="profile-setup-avatar-wrapper">
            <div
              className="profile-setup-avatar"
              style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {}}
              onClick={() => fileRef.current?.click()}
            >
              {!avatarPreview && '📷'}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="mb-12">
            <input
              className="modal-input"
              type="text"
              placeholder="@username"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              maxLength={20}
            />
          </div>

          <div className="mb-12">
            <input
              className="modal-input"
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="mb-16">
            <input
              className="modal-input"
              type="text"
              placeholder="About (optional)"
              value={about}
              onChange={e => setAbout(e.target.value)}
              maxLength={140}
            />
          </div>

          <button
            className="modal-btn modal-btn-primary w-full"
            type="submit"
            disabled={loading}
            style={{ padding: '12px', fontSize: '16px' }}
          >
            {loading ? 'Setting up...' : 'Continue to Chat'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
