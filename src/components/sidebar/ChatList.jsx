/**
 * ChatList — thin wrapper that renders filtered conversaion items.
 * Actual rendering logic moved to Sidebar.jsx.
 */
const ChatList = ({ children }) => {
  return <div className="chat-list">{children}</div>;
};

export default ChatList;
