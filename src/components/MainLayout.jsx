import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';
import { usePresence } from '../hooks/usePresence';
import { useStories } from '../hooks/useStories';
import Sidebar from './sidebar/Sidebar';
import ChatPanel from './chat/ChatPanel';

/**
 * MainLayout — two-panel layout with offline detection.
 */
const MainLayout = () => {
  const { currentUser, profile } = useAuth();
  const userId = currentUser?.id;

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const convHook = useConversations(userId);
  const presenceHook = usePresence(userId, activeConversationId);
  const storiesHook = useStories(userId);

  // Offline detection
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const activeConversation = convHook.conversations.find(c => c.id === activeConversationId);

  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
    setShowMobileSidebar(false);
  };

  const handleBack = () => {
    setShowMobileSidebar(true);
    setActiveConversationId(null);
  };

  return (
    <div className="main-layout">
      {isOffline && (
        <div className="offline-banner">
          ⚡ No internet connection. Messages will be sent when you're back online.
        </div>
      )}
      <Sidebar
        className={!showMobileSidebar ? 'hidden' : ''}
        conversations={convHook.conversations}
        loading={convHook.loading}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        presenceHook={presenceHook}
        storiesHook={storiesHook}
        convHook={convHook}
        profile={profile}
      />
      <ChatPanel
        className={showMobileSidebar ? 'hidden' : ''}
        conversation={activeConversation}
        conversationId={activeConversationId}
        presenceHook={presenceHook}
        convHook={convHook}
        onBack={handleBack}
      />
    </div>
  );
};

export default MainLayout;
