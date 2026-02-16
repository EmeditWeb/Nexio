import { useState, useEffect, useRef } from 'react';

/**
 * StoryViewer — full-screen overlay for viewing stories with progress bar.
 */
const StoryViewer = ({ storyGroup, onClose, onView }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const stories = storyGroup.stories;

    const STORY_DURATION = 5000; // 5 seconds per story

    useEffect(() => {
        if (!stories.length) return;

        // Mark story as viewed
        onView(stories[currentIndex].id);

        // Progress animation
        setProgress(0);
        const startTime = Date.now();

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(pct);

            if (elapsed >= STORY_DURATION) {
                clearInterval(timerRef.current);
                // Move to next story or close
                if (currentIndex < stories.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    onClose();
                }
            }
        }, 50);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, stories, onView, onClose]);

    const goNext = () => {
        clearInterval(timerRef.current);
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const goPrev = () => {
        clearInterval(timerRef.current);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const current = stories[currentIndex];
    if (!current) return null;

    const formatTime = (ts) => {
        const date = new Date(ts);
        const now = new Date();
        const diff = now - date;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="story-viewer-overlay" onClick={onClose}>
            <div className="story-viewer" onClick={e => e.stopPropagation()}>
                {/* Progress bars */}
                <div className="story-progress-bar">
                    {stories.map((_, idx) => (
                        <div className="story-progress-segment" key={idx}>
                            <div
                                className="story-progress-fill"
                                style={{
                                    width: idx < currentIndex ? '100%'
                                        : idx === currentIndex ? `${progress}%`
                                            : '0%',
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="story-header">
                    <div
                        className="story-header-avatar"
                        style={storyGroup.user.avatar_url
                            ? { backgroundImage: `url(${storyGroup.user.avatar_url})` }
                            : { backgroundColor: 'var(--bg-hover)' }
                        }
                    />
                    <div style={{ flex: 1 }}>
                        <div className="story-header-name">{storyGroup.user.display_name}</div>
                        <div className="story-header-time">{formatTime(current.created_at)}</div>
                    </div>
                    <button className="icon-btn" onClick={onClose} style={{ color: 'white' }}>✕</button>
                </div>

                {/* Story content — click left/right to navigate */}
                <div className="story-content" style={{ position: 'relative' }}>
                    {/* Left tap area */}
                    <div
                        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', cursor: 'pointer' }}
                        onClick={goPrev}
                    />
                    {/* Right tap area */}
                    <div
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', cursor: 'pointer' }}
                        onClick={goNext}
                    />

                    {current.media_url ? (
                        <img src={current.media_url} alt="Story" className="story-image-content" />
                    ) : (
                        <div className="story-text-content">{current.content}</div>
                    )}
                </div>

                {/* View count for own stories */}
                {current.story_views && (
                    <div style={{
                        padding: '8px 16px',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.6)',
                    }}>
                        👁 {current.story_views.length} views
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryViewer;
