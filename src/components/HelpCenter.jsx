import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './InfoPages.css';

/* ── Chevron SVG ─────────────────────────────────────────── */
const Chevron = () => (
    <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
    </svg>
);

/* ── FAQ Item Component ──────────────────────────────────── */
const FaqItem = ({ question, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className={`faq-item ${open ? 'open' : ''}`}>
            <button className="faq-question" onClick={() => setOpen(!open)}>
                {question}
                <Chevron />
            </button>
            <div className="faq-answer">
                {children}
            </div>
        </div>
    );
};

/* ── Help Center Page ────────────────────────────────────── */
const HelpCenter = () => {
    const navigate = useNavigate();

    return (
        <div className="info-page">
            <nav className="info-nav">
                <button className="info-nav-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back
                </button>
                <span className="info-nav-logo">nexio</span>
            </nav>

            <div className="info-content">
                <header className="info-header">
                    <h1>Help Center</h1>
                    <span className="info-updated">Everything you need to know about Nexio</span>
                </header>

                {/* ── Quick Start Guide ────────────────────────────────── */}
                <div className="info-section">
                    <h2>Quick Start Guide</h2>
                    <p>New to Nexio? Follow these steps to get started in minutes.</p>

                    <div className="nav-steps">
                        <div className="nav-step">
                            <div className="nav-step-num">1</div>
                            <div className="nav-step-content">
                                <h4>Create Your Account</h4>
                                <p>Sign up with your email and password, or continue with GitHub for one-click access.</p>
                            </div>
                        </div>
                        <div className="nav-step">
                            <div className="nav-step-num">2</div>
                            <div className="nav-step-content">
                                <h4>Set Up Your Profile</h4>
                                <p>Choose a unique @username, add a display name, upload a profile picture, and write a short about text.</p>
                            </div>
                        </div>
                        <div className="nav-step">
                            <div className="nav-step-num">3</div>
                            <div className="nav-step-content">
                                <h4>Start a Conversation</h4>
                                <p>Click the new chat icon in the sidebar header, search for a user by @username, and send your first message!</p>
                            </div>
                        </div>
                        <div className="nav-step">
                            <div className="nav-step-num">4</div>
                            <div className="nav-step-content">
                                <h4>Create a Group</h4>
                                <p>Click the group icon in the sidebar header, name your group, add members, and start chatting together.</p>
                            </div>
                        </div>
                        <div className="nav-step">
                            <div className="nav-step-num">5</div>
                            <div className="nav-step-content">
                                <h4>Share a Story</h4>
                                <p>Click the "+" button in the stories row at the top of the sidebar to post a text or image story that lasts 24 hours.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Features Overview ────────────────────────────────── */}
                <div className="info-section">
                    <h2>Features</h2>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-icon">💬</div>
                            <h3>Direct Messages</h3>
                            <p>Private one-on-one conversations with real-time delivery, read receipts, and typing indicators.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-card-icon">👥</div>
                            <h3>Group Chats</h3>
                            <p>Create groups with names, avatars, and descriptions. Add or remove members. Admin controls included.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-card-icon">📷</div>
                            <h3>Stories</h3>
                            <p>Share text or image stories that expire after 24 hours. See who viewed your story.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-card-icon">🖼️</div>
                            <h3>Image Sharing</h3>
                            <p>Send images in chats with a click. Preview images full-screen by tapping them.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-card-icon">↩️</div>
                            <h3>Quoted Replies</h3>
                            <p>Right-click any message and choose "Reply" to quote it in your response for clear context.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-card-icon">🟢</div>
                            <h3>Online Status</h3>
                            <p>See who's online with green dots. Last seen timestamps show when someone was last active.</p>
                        </div>
                    </div>
                </div>

                {/* ── Navigating the App ───────────────────────────────── */}
                <div className="info-section">
                    <h2>Navigating the App</h2>

                    <div className="info-card" style={{ marginBottom: 16 }}>
                        <h3>🗂️ Sidebar (Left Panel)</h3>
                        <p>
                            The sidebar shows your conversations, stories, and search. The header has three icons:
                            <strong> New Chat</strong> (pencil), <strong>New Group</strong> (people), and <strong>Settings</strong> (gear).
                            Use the search bar to filter your conversations by name.
                        </p>
                    </div>

                    <div className="info-card" style={{ marginBottom: 16 }}>
                        <h3>💬 Chat Panel (Right Panel)</h3>
                        <p>
                            Click a conversation in the sidebar to open it. The chat header shows the contact name,
                            online status, and typing indicator. Type your message at the bottom — press <strong>Enter</strong> to send
                            or <strong>Shift+Enter</strong> for a new line.
                        </p>
                    </div>

                    <div className="info-card" style={{ marginBottom: 16 }}>
                        <h3>⚙️ Settings</h3>
                        <p>
                            Click the gear icon in the sidebar header. Here you can update your avatar, display name,
                            about text, log out, or permanently delete your account.
                        </p>
                    </div>

                    <div className="info-card">
                        <h3>ℹ️ Group Info</h3>
                        <p>
                            Click the group name in the chat header to open Group Info. Admins can edit the group name,
                            add/remove members, or delete the group. Any member can leave.
                        </p>
                    </div>
                </div>

                {/* ── FAQ — Getting Started ───────────────────────────── */}
                <div className="faq-section">
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, borderBottom: '2px solid #1877F2', display: 'inline-block', paddingBottom: 8 }}>
                        Frequently Asked Questions
                    </h2>

                    <div className="faq-category">
                        <div className="faq-category-title">Getting Started</div>

                        <FaqItem question="How do I create an account?">
                            <p>
                                Visit the login page and click <strong>"Sign Up"</strong>. Enter your display name, email,
                                and password. You can also click <strong>"Continue with GitHub"</strong> for instant access
                                using your GitHub account.
                            </p>
                        </FaqItem>

                        <FaqItem question="I signed up but can't log in — what's wrong?">
                            <p>
                                If you signed up with email/password, check your inbox for a <strong>confirmation email</strong> from
                                Supabase. Click the link to verify your account before logging in. Check your spam folder if
                                you don't see it.
                            </p>
                        </FaqItem>

                        <FaqItem question="How do I choose a username?">
                            <p>
                                After your first login, you'll be directed to the Profile Setup page. Pick a unique @username
                                (lowercase, no spaces). This is how other users will find you on Nexio.
                            </p>
                        </FaqItem>

                        <FaqItem question="Can I change my username later?">
                            <p>
                                Your username is set during profile setup and serves as your unique identifier. Currently,
                                changing your username after initial setup requires contacting support.
                            </p>
                        </FaqItem>
                    </div>

                    {/* ── FAQ — Messaging ──────────────────────────────────── */}
                    <div className="faq-category">
                        <div className="faq-category-title">Messaging</div>

                        <FaqItem question="How do I start a new conversation?">
                            <ol>
                                <li>Click the <strong>new chat icon</strong> (pencil) in the sidebar header</li>
                                <li>Search for a user by their @username</li>
                                <li>Click their name to open a conversation</li>
                                <li>Type your message and press Enter!</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="What do the checkmarks mean?">
                            <p>
                                <strong>✓</strong> (single) = Message sent<br />
                                <strong>✓✓</strong> (double grey) = Message delivered<br />
                                <strong>✓✓</strong> (double blue) = Message read
                            </p>
                        </FaqItem>

                        <FaqItem question="How do I send an image?">
                            <p>
                                Click the <strong>📎 attachment icon</strong> in the message input area, then select an image
                                file from your device. The image will be uploaded and sent to the conversation.
                            </p>
                        </FaqItem>

                        <FaqItem question="How do I reply to a specific message?">
                            <p>
                                <strong>Right-click</strong> (or long-press on mobile) on any message to open the context menu.
                                Select <strong>"Reply"</strong> to quote that message in your next reply.
                            </p>
                        </FaqItem>

                        <FaqItem question="Can I delete a message?">
                            <p>
                                Yes! Right-click a message and choose:
                            </p>
                            <ol>
                                <li><strong>"Delete for me"</strong> — removes it from your view only</li>
                                <li><strong>"Delete for everyone"</strong> — removes it for all participants (your messages only)</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="How do I use emojis?">
                            <p>
                                Click the <strong>😊 smiley icon</strong> in the message input area to open the emoji picker.
                                Click any emoji to insert it into your message.
                            </p>
                        </FaqItem>
                    </div>

                    {/* ── FAQ — Groups ─────────────────────────────────────── */}
                    <div className="faq-category">
                        <div className="faq-category-title">Group Chats</div>

                        <FaqItem question="How do I create a group?">
                            <ol>
                                <li>Click the <strong>group icon</strong> (people) in the sidebar header</li>
                                <li>Enter a group name and optional description</li>
                                <li>Optionally upload a group avatar</li>
                                <li>Click "Next" to search and add members by @username</li>
                                <li>Click "Create Group" to finish</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="How do I add or remove members?">
                            <p>
                                Open the group chat, click the <strong>group name</strong> in the header to open Group Info.
                                If you're an admin, you'll see options to add or remove members.
                            </p>
                        </FaqItem>

                        <FaqItem question="How do I leave a group?">
                            <p>
                                Open Group Info by clicking the group name in the chat header, then scroll down and
                                click <strong>"Leave Group"</strong>. This action is irreversible — you'll need to be
                                re-added by an admin.
                            </p>
                        </FaqItem>

                        <FaqItem question="What can group admins do?">
                            <p>
                                Admins (the group creator) can: edit the group name, add/remove members, and delete
                                the entire group. Regular members can only send messages and leave.
                            </p>
                        </FaqItem>
                    </div>

                    {/* ── FAQ — Stories ────────────────────────────────────── */}
                    <div className="faq-category">
                        <div className="faq-category-title">Stories</div>

                        <FaqItem question="How do I post a story?">
                            <p>
                                Click the <strong>"+"</strong> button in the Stories row at the top of the sidebar.
                                Choose between a text story or an image story, add your content, and click "Post Story."
                            </p>
                        </FaqItem>

                        <FaqItem question="How long do stories last?">
                            <p>
                                Stories automatically expire and are deleted after <strong>24 hours</strong>. There's no
                                way to extend a story's duration.
                            </p>
                        </FaqItem>

                        <FaqItem question="Can I see who viewed my story?">
                            <p>
                                Yes! When viewing your own story, you'll see a <strong>view count</strong> at the bottom
                                showing how many people have seen it.
                            </p>
                        </FaqItem>
                    </div>

                    {/* ── FAQ — Troubleshooting ────────────────────────────── */}
                    <div className="faq-category">
                        <div className="faq-category-title">Troubleshooting</div>

                        <FaqItem question="Messages aren't sending — what should I do?">
                            <p>Try these steps:</p>
                            <ol>
                                <li>Check your internet connection</li>
                                <li>Refresh the page (<code>Ctrl+R</code> or <code>Cmd+R</code>)</li>
                                <li>Make sure you're still logged in — if your session expired, log in again</li>
                                <li>If the issue persists, log out and log back in to refresh your session</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="I can't see new messages from others">
                            <p>
                                Nexio uses real-time connections. If messages stop appearing:
                            </p>
                            <ol>
                                <li>Refresh the page to re-establish the real-time connection</li>
                                <li>Check if the browser tab was in the background for a long time — WebSocket connections may drop</li>
                                <li>Try a hard refresh: <code>Ctrl+Shift+R</code> (Windows/Linux) or <code>Cmd+Shift+R</code> (Mac)</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="Image upload is failing">
                            <p>Common causes and fixes:</p>
                            <ol>
                                <li><strong>File too large:</strong> Try an image under 5MB</li>
                                <li><strong>Wrong format:</strong> Supported formats are JPG, PNG, GIF, and WebP</li>
                                <li><strong>Storage bucket issue:</strong> If you're self-hosting, ensure the Supabase storage buckets (<code>chat-media</code>, <code>profile-images</code>, <code>story-media</code>) are created and set to public</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="My online status isn't showing to others">
                            <p>
                                Online status uses a heartbeat system. Make sure:
                            </p>
                            <ol>
                                <li>You have a stable internet connection</li>
                                <li>The browser tab is in the foreground (background tabs may throttle updates)</li>
                                <li>Try logging out and back in to reset the presence system</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="I forgot my password">
                            <p>
                                Currently, password reset is handled through Supabase email recovery. Click
                                <strong> "Forgot password?"</strong> on the login page (feature depends on your
                                Supabase project's email configuration). If you signed up via GitHub, simply
                                use the "Continue with GitHub" button — no password needed.
                            </p>
                        </FaqItem>

                        <FaqItem question="The app looks broken or styles are wrong">
                            <p>Try these fixes:</p>
                            <ol>
                                <li>Hard refresh: <code>Ctrl+Shift+R</code> (Windows/Linux) or <code>Cmd+Shift+R</code> (Mac)</li>
                                <li>Clear your browser cache</li>
                                <li>Make sure you're using a modern browser (Chrome, Firefox, Edge, or Safari)</li>
                                <li>Disable browser extensions that might interfere with CSS</li>
                            </ol>
                        </FaqItem>

                        <FaqItem question="How do I delete my account?">
                            <p>
                                Go to <strong>Settings</strong> (gear icon in sidebar) → scroll to the bottom →
                                click <strong>"Delete Account"</strong>. You'll be asked to confirm. This action is
                                <strong> permanent</strong> and will delete your profile, messages, and all associated data.
                            </p>
                        </FaqItem>
                    </div>
                </div>

                {/* ── Contact Card ───────────────────────────────────────── */}
                <div className="info-contact-card">
                    <h3>Still need help?</h3>
                    <p>We're here for you. Reach out and we'll get back to you as soon as possible.</p>
                    <a href="mailto:support@nexio.app" className="info-contact-btn">
                        Contact Support
                    </a>
                </div>

                <footer className="info-footer">
                    © 2026 Nexio. All rights reserved.
                    <br />
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                    <Link to="/help">Help</Link>
                </footer>
            </div>
        </div>
    );
};

export default HelpCenter;
