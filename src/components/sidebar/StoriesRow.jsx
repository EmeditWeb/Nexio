import { useState } from 'react';
import StoryViewer from '../chat/StoryViewer';
import CreateStory from '../chat/CreateStory';
import { useAuth } from '../../contexts/AuthContext';

/**
 * StoriesRow — horizontal scrollable story avatars with colored rings.
 * Features:
 * - "Add Story" button first
 * - Gradient rings for unviewed stories (green/blue/pink)
 * - Grey rings for viewed stories
 * - Sorted by unviewed first, then time
 */
const StoriesRow = ({ storiesHook, compact = false }) => {
  const { currentUser } = useAuth();
  const [viewingStory, setViewingStory] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const { stories = [], myStories = [], viewStory, loading } = storiesHook || {};

  // Current user's story status
  const hasMyStory = myStories.length > 0;
  const myLastStory = myStories[myStories.length - 1];

  return (
    <>
      <div className={`stories-row ${compact ? '' : ''}`}>

        {/* 1. Add Story / My Story Button */}
        <div className="story-item" onClick={() => hasMyStory ? setViewingStory({ user: currentUser, stories: myStories }) : setShowCreate(true)}>
          <div className={`story-avatar-wrapper ${hasMyStory ? 'has-story' : ''}`}>
            {/* If I have a story, show my avatar with a grey ring (since I always view my own). 
                 If no story, show avatar with + badge */}
            <div className={`story-ring ${hasMyStory ? 'viewed' : ''}`}>
              <div
                className="story-avatar"
                style={currentUser?.avatar_url ? { backgroundImage: `url(${currentUser.avatar_url})` } : {}}
              >
                {!currentUser?.avatar_url && (
                  <div className="avatar-placeholder">{currentUser?.display_name?.[0]?.toUpperCase()}</div>
                )}
              </div>
            </div>

            {!hasMyStory && (
              <div className="story-add-badge">+</div>
            )}
          </div>
          <span className="story-username">Your Story</span>
        </div>

        {/* 2. Friends' Stories */}
        {stories.map((group, i) => {
          // Skip own story group since we handled it above
          if (group.user.id === currentUser?.id) return null;

          return (
            <div
              key={group.user.id}
              className="story-item"
              onClick={() => setViewingStory(group)}
            >
              <div className="story-avatar-wrapper">
                <div className={`story-ring ${group.hasUnviewed ? 'unviewed' : 'viewed'}`}>
                  <div
                    className="story-avatar"
                    style={group.user.avatar_url ? { backgroundImage: `url(${group.user.avatar_url})` } : {}}
                  >
                    {!group.user.avatar_url && (
                      <div className="avatar-placeholder">{group.user?.display_name?.[0]?.toUpperCase() || '?'}</div>
                    )}
                  </div>
                </div>
              </div>
              <span className="story-username">
                {group.user?.display_name?.split(' ')[0] || group.user?.username || 'User'}
              </span>
            </div>
          );
        })}

        {!compact && stories.length === 0 && !hasMyStory && !loading && (
          <div className="stories-empty-hint">
            👋 Share a moment!
          </div>
        )}
      </div>

      {viewingStory && (
        <StoryViewer
          storyGroup={viewingStory}
          onClose={() => setViewingStory(null)}
          onViewed={viewStory}
          isOwnStory={viewingStory.user.id === currentUser?.id}
          onAddStory={() => { setViewingStory(null); setShowCreate(true); }}
        />
      )}

      {showCreate && (
        <CreateStory
          onClose={() => setShowCreate(false)}
          onCreated={() => setShowCreate(false)}
          storiesHook={storiesHook}
        />
      )}
    </>
  );
};

export default StoriesRow;
