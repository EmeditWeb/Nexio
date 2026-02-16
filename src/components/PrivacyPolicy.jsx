import { useNavigate, Link } from 'react-router-dom';
import './InfoPages.css';

const PrivacyPolicy = () => {
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
                    <h1>Privacy Policy</h1>
                    <span className="info-updated">Last updated: February 14, 2026</span>
                </header>

                <div className="info-section">
                    <h2>Your Privacy Matters</h2>
                    <p>
                        At Nexio, we believe that privacy is a fundamental right. This policy explains what information
                        we collect, how we use it, and the choices you have. We designed Nexio with privacy in mind —
                        your conversations belong to you.
                    </p>
                </div>

                <div className="info-section">
                    <h2>Information We Collect</h2>

                    <h3>Account Information</h3>
                    <p>When you create an account, we collect:</p>
                    <ul>
                        <li>Email address (for authentication and account recovery)</li>
                        <li>Display name and username (to identify you to other users)</li>
                        <li>Profile picture (optional, stored securely in our cloud storage)</li>
                        <li>About text (optional, shown on your profile)</li>
                    </ul>

                    <h3>Messages & Media</h3>
                    <p>
                        Your messages, images, and story content are stored on our servers to deliver them to your
                        conversations. We do not read, analyze, or sell your message content.
                    </p>
                    <ul>
                        <li>Text messages are stored in our encrypted database</li>
                        <li>Images and media files are stored in secure cloud storage buckets</li>
                        <li>Stories automatically expire and are deleted after 24 hours</li>
                    </ul>

                    <h3>Usage Information</h3>
                    <ul>
                        <li>Online/offline status and last seen timestamps</li>
                        <li>Message delivery and read receipts</li>
                        <li>Typing indicators (transmitted in real-time, not stored)</li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>How We Use Your Information</h2>
                    <ul>
                        <li>To provide and maintain the Nexio messaging service</li>
                        <li>To deliver messages and media to your conversations</li>
                        <li>To show your online status and typing indicators to contacts</li>
                        <li>To enable you to find and connect with other users</li>
                        <li>To protect against abuse, fraud, and security threats</li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>Data Storage & Security</h2>
                    <p>
                        Your data is stored using <strong>Supabase</strong>, a secure, enterprise-grade platform
                        with Row Level Security (RLS) enforced on every table. This means users can only access
                        their own data and conversations they belong to.
                    </p>
                    <ul>
                        <li>All data transmissions use HTTPS/TLS encryption</li>
                        <li>Database access is protected by Row Level Security policies</li>
                        <li>Authentication is handled by Supabase Auth with industry-standard protocols</li>
                        <li>Passwords are hashed and never stored in plain text</li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>Third-Party Services</h2>
                    <p>Nexio integrates with the following third-party services:</p>
                    <ul>
                        <li><strong>Supabase</strong> — Database, authentication, real-time messaging, and file storage</li>
                        <li><strong>GitHub OAuth</strong> — Optional sign-in method (we receive your public profile and email)</li>
                    </ul>
                    <p>We do not share your data with advertisers or sell your information to any third party.</p>
                </div>

                <div className="info-section">
                    <h2>Your Rights & Choices</h2>
                    <ul>
                        <li><strong>Access:</strong> View your profile data at any time in Settings</li>
                        <li><strong>Update:</strong> Modify your display name, username, about text, and avatar</li>
                        <li><strong>Delete:</strong> Permanently delete your account and all associated data from Settings</li>
                        <li><strong>Message deletion:</strong> Delete messages for yourself or for everyone in a conversation</li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>Data Retention</h2>
                    <ul>
                        <li>Account data is retained until you delete your account</li>
                        <li>Messages are retained for the lifetime of the conversation</li>
                        <li>Stories are automatically deleted after 24 hours</li>
                        <li>Deleted messages are marked as deleted and content is cleared immediately</li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or your data, please reach out through
                        our <Link to="/help">Help Center</Link>.
                    </p>
                </div>

                <footer className="info-footer">
                    © 2026 Nexio. All rights reserved. EmediWEB
                    <br />
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                    <Link to="/help">Help</Link>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
