import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StoryViewer from '../chat/StoryViewer';
import CreateStory from '../chat/CreateStory';

/**
 * StoriesRow — horizontal scrolling row of story avatars at top of sidebar.
 */
const StoriesRow = ({ storiesHook }) => {
  const { currentUser } = useAuth();
  const { stories, myStories } = storiesHook;
  const [viewingUser, setViewingUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  if (!stories.length && !myStories.length) {
    return (
      <div className="stories-row">
        <div className="story-avatar-wrapper" onClick={() => setShowCreate(true)}>
          <div className="story-avatar-ring add-story">
            <div className="story-avatar-img flex-center" style={{ fontSize: '20px' }}>+</div>
          </div>
          <span className="story-username">My Status</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="stories-row">
        {/* Add story button */}
        <div className="story-avatar-wrapper" onClick={() => setShowCreate(true)}>
          <div className={`story-avatar-ring ${myStories.length > 0 ? '' : 'add-story'}`}>
            <div
              className="story-avatar-img"
              style={
                myStories.length > 0 && stories[0]?.user?.avatar_url
                  ? { backgroundImage: `url(${stories[0].user.avatar_url})` }
                  : { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }
              }
            >
              {myStories.length === 0 && '+'}
            </div>
          </div>
          <span className="story-username">My Status</span>
        </div>

        {/* Other users' stories */}
        {stories.filter(s => s.user.id !== currentUser?.id).map(storyGroup => (
          <div
            key={storyGroup.user.id}
            className="story-avatar-wrapper"
            onClick={() => setViewingUser(storyGroup)}
          >
            <div className={`story-avatar-ring ${storyGroup.hasUnviewed ? '' : 'viewed'}`}>
              <div
                className="story-avatar-img"
                style={storyGroup.user.avatar_url
                  ? { backgroundImage: `url(${storyGroup.user.avatar_url})` }
                  : {}
                }
              />
            </div>
            <span className="story-username">{storyGroup.user.display_name}</span>
          </div>
        ))}
      </div>

      {viewingUser && (
        <StoryViewer
          storyGroup={viewingUser}
          onClose={() => setViewingUser(null)}
          onView={storiesHook.viewStory}
        />
      )}

      {showCreate && (
        <CreateStory
          onClose={() => setShowCreate(false)}
          onCreate={storiesHook.createStory}
        />
      )}
    </>
  );
};

export default StoriesRow;
