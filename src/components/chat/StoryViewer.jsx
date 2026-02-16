import { useState, useEffect, useCallback, useRef } from 'react';
import { formatLastSeen } from '../../utils/dateUtils';
import { STORY_DURATION_MS } from '../../utils/constants';

/**
 * StoryViewer — Full-screen story overlay.
 */
const StoryViewer = ({ storyGroup, onClose, onViewed, isOwnStory, onAddStory }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(null);
    const startTimeRef = useRef(null);
    const pausedRef = useRef(false);

    const stories = storyGroup?.stories || [];
    const current = stories[currentIndex];
    const user = storyGroup?.user || {};

    // Start/Reset progress for current slide
    useEffect(() => {
        setProgress(0);
        startTimeRef.current = Date.now();
        pausedRef.current = false;

        const interval = setInterval(() => {
            if (pausedRef.current) {
                // Adjust start time to account for pause so it doesn't jump
                startTimeRef.current += 50; 
                return;
            }

            const elapsed = Date.now() - startTimeRef.current;
            const p = Math.min((elapsed / STORY_DURATION_MS) * 100, 100);
            setProgress(p);

            if (p >= 100) {
                clearInterval(interval);
                handleNext();
            }
        }, 50);

        progressRef.current = interval;

        // Mark as viewed
        if (current && onViewed && !isOwnStory) {
             onViewed(current.id);
        }

        return () => clearInterval(progressRef.current);
    }, [currentIndex, current]); // Re-run when slide changes

    const handleNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            // If at start, restart current or close? WhatsApp closes on pull down, but for tap left at start usually restarts or goes to prev user.
            // For now, let's just restart the slide if < 0.5s elapsed, else go to 0
            setCurrentIndex(0);
            setProgress(0);
            startTimeRef.current = Date.now();
        }
    }, [currentIndex]);

    const handleTap = useCallback((e) => {
        const width = window.innerWidth;
        const x = e.clientX;
        
        // Tap left 30% goes back, right 70% goes forward
        if (x < width * 0.3) {
            handlePrev();
        } else {
            handleNext();
        }
    }, [handlePrev, handleNext]);

    if (!current) return null;

    return (
        <div 
            className="story-viewer-overlay" 
            onClick={handleTap}
            // Simple hold to pause
            onMouseDown={() => { pausedRef.current = true; }}
            onMouseUp={() => { pausedRef.current = false; }}
            onTouchStart={() => { pausedRef.current = true; }}
            onTouchEnd={() => { pausedRef.current = false; }}
        >
            <div className="story-content-wrapper">
                
                {/* 1. Progress Bars */}
                <div className="story-progress-container">
                    {stories.map((_, i) => (
                        <div key={i} className="story-progress-bg">
                            <div 
                                className="story-progress-fill"
                                style={{ 
                                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* 2. Header */}
                <div className="story-header" onClick={e => e.stopPropagation()}>
                    <button className="icon-btn back-btn" onClick={onClose} style={{marginRight: 8}}>←</button>
                    <div 
                        className="story-header-avatar"
                        style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
                    >
                         {!user.avatar_url && user.display_name?.[0]}
                    </div>
                    <div className="story-header-info">
                        <div className="story-header-name">{user.display_name || user.username}</div>
                        <div className="story-header-time">{formatLastSeen(current.created_at)}</div>
                    </div>
                    
                    {/* Actions */}
                    <div className="story-header-actions">
                        {isOwnStory && (
                            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onAddStory(); }}>
                                ➕
                            </button>
                        )}
                        <button className="icon-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* 3. Media Content */}
                <div className="story-media-container">
                    {current.media_url ? (
                        <img 
                            src={current.media_url} 
                            className="story-image" 
                            alt="Story" 
                        />
                    ) : (
                        <div className="story-text-bg">
                            <p className="story-text">{current.content}</p>
                        </div>
                    )}
                </div>
            
                {/* 4. Footer / Reply (for friends) or Views (for me) */}
                <div className="story-footer" onClick={e => e.stopPropagation()}>
                    {!isOwnStory ? (
                         <div className="story-reply-bar">
                            <input type="text" placeholder="Reply..." className="story-reply-input" />
                            <button className="icon-btn">❤️</button>
                            <button className="icon-btn">😂</button>
                         </div>
                    ) : (
                        <div className="story-views-bar">
                             <span role="img" aria-label="views">👁️</span> {current.story_views?.length || 0} views
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
