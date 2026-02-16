import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';
import { usePresence } from '../hooks/usePresence';
import { useStories } from '../hooks/useStories';

import Sidebar from './sidebar/Sidebar';
import ChatPanel from './chat/ChatPanel';

/**
 * MainLayout — the WhatsApp-style two-panel layout.
 * Manages active conversation state and passes context down.
 */
const MainLayout = () => {
    const { currentUser, profile } = useAuth();
    const userId = currentUser?.id;

    const [activeConversationId, setActiveConversationId] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(true);

    const convHook = useConversations(userId);
    const presenceHook = usePresence(userId, activeConversationId);
    const storiesHook = useStories(userId);

    // Find active conversation data
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
            <Sidebar
                className={!showMobileSidebar ? 'hidden' : ''}
                conversations={convHook.conversations}
                loading={convHook.loading}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                presenceHook={presenceHook}
                storiesHook={storiesHook}
                convHook={convHook}
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
