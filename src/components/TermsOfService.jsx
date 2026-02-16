import { useNavigate, Link } from 'react-router-dom';
import './InfoPages.css';

const TermsOfService = () => {
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
          <h1>Terms of Service</h1>
          <span className="info-updated">Last updated: February 14, 2026</span>
        </header>

        <div className="info-section">
          <h2>Welcome to Nexio</h2>
          <p>
            These Terms of Service ("Terms") govern your use of the Nexio messaging platform.
            By creating an account or using Nexio, you agree to be bound by these Terms. If you
            do not agree, please do not use the service.
          </p>
        </div>

        <div className="info-section">
          <h2>Using Nexio</h2>

          <h3>Eligibility</h3>
          <p>
            You must be at least 13 years of age to use Nexio. If you are under 18, you represent
            that your parent or legal guardian has reviewed and agreed to these Terms.
          </p>

          <h3>Your Account</h3>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your login credentials</li>
            <li>You must provide accurate information during registration</li>
            <li>Your username must be unique and must not impersonate another person or entity</li>
            <li>You may not create more than one account per person</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Acceptable Use</h2>
          <p>You agree to use Nexio in a responsible and lawful manner. You must not:</p>
          <ul>
            <li>Send spam, unsolicited messages, or bulk automated communications</li>
            <li>Share content that is illegal, harmful, threatening, abusive, or harassing</li>
            <li>Upload malware, viruses, or malicious code</li>
            <li>Attempt to access other users' accounts or private data</li>
            <li>Circumvent or interfere with the platform's security features</li>
            <li>Use Nexio for any illegal or unauthorized purpose</li>
            <li>Violate the intellectual property rights of others</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Your Content</h2>
          <p>
            You retain ownership of the content you create and share on Nexio, including messages,
            images, and stories. By posting content, you grant Nexio a limited license to store,
            display, and deliver that content to the intended recipients.
          </p>
          <ul>
            <li>You are solely responsible for the content you share</li>
            <li>You must have the right to share any content you upload</li>
            <li>Stories expire and are automatically deleted after 24 hours</li>
            <li>You can delete your messages at any time</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Group Chats</h2>
          <ul>
            <li>Group admins are responsible for managing their group's membership and content</li>
            <li>Admins can add or remove members, update group details, or delete the group</li>
            <li>Any member can leave a group at any time</li>
            <li>Group names and descriptions must comply with our acceptable use policy</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Intellectual Property</h2>
          <p>
            The Nexio name, logo, and all associated branding are the property of Nexio.
            The software underlying the platform is proprietary. You may not copy, modify,
            distribute, or reverse engineer any part of the Nexio service.
          </p>
        </div>

        <div className="info-section">
          <h2>Account Termination</h2>
          <ul>
            <li>You can delete your account at any time from Settings — this is permanent and irreversible</li>
            <li>We may suspend or terminate accounts that violate these Terms</li>
            <li>Upon deletion, your profile data, messages, and media will be permanently removed</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Disclaimers</h2>
          <p>
            Nexio is provided "as is" and "as available" without warranties of any kind. We do our
            best to keep the service running smoothly, but we cannot guarantee uninterrupted or
            error-free operation. We are not liable for any damages arising from your use of the service.
          </p>
        </div>

        <div className="info-section">
          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. If we make significant changes, we will
            notify users through the platform. Your continued use of Nexio after changes constitutes
            acceptance of the updated Terms.
          </p>
        </div>

        <div className="info-section">
          <h2>Contact</h2>
          <p>
            Questions about these Terms? Visit our <Link to="/help">Help Center</Link> for support.
          </p>
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

export default TermsOfService;
