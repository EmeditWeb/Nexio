// ═══════════════════════════════════════════════════════════
// Nexio — App Constants
// ═══════════════════════════════════════════════════════════

// ── Upload Limits ────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// ── Messaging ────────────────────────────────────────────
export const MAX_MESSAGE_LENGTH = 2000;
export const MESSAGES_PER_PAGE = 50;
export const CONVERSATIONS_PER_PAGE = 30;

// ── Search ───────────────────────────────────────────────
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MIN_CHARS = 2;
export const SEARCH_RESULTS_LIMIT = 20;

// ── Groups ───────────────────────────────────────────────
export const GROUP_NAME_MIN_LENGTH = 3;
export const GROUP_MAX_MEMBERS = 256;

// ── Presence ─────────────────────────────────────────────
export const HEARTBEAT_INTERVAL_MS = 30000;
export const TYPING_TIMEOUT_MS = 3000;
export const TYPING_DEBOUNCE_MS = 2000;

// ── Stories ──────────────────────────────────────────────
export const STORY_DURATION_MS = 5000; // how long each story displays
export const STORY_EXPIRY_HOURS = 12;

// ── Theme ────────────────────────────────────────────────
export const THEME_KEY = 'nexio-theme';
export const THEMES = {
    dark: {
        name: 'Dark',
        class: 'dark',
    },
    light: {
        name: 'Light',
        class: 'light',
    },
};

// ── Nexio Brand Colors (reference) ──────────────────────
export const COLORS = {
    primaryBg: '#0A0A0F',
    secondaryBg: '#12121A',
    panelBg: '#1A1A27',
    accent: '#6C63FF',
    accentPink: '#FF6584',
    success: '#00D9A3',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B8BA7',
    border: '#2A2A3D',
    sentBubble: '#6C63FF',
    receivedBubble: '#1A1A27',
};
