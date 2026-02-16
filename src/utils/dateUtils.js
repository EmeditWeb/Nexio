// ═══════════════════════════════════════════════════════════
// Nexio — Date Utilities
// Smart timestamps, message times, and date labels.
// ═══════════════════════════════════════════════════════════

/**
 * Format a smart timestamp for chat list items.
 * "just now", "2m", "1h", "Yesterday", "Feb 14"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatSmartTimestamp(dateInput) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()) {
        return 'yesterday';
    }

    // Within this year
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format time for inside message bubbles.
 * "10:30 AM"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatMessageTime(dateInput) {
    if (!dateInput) return '';
    return new Date(dateInput).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Get date label for message date dividers.
 * "Today", "Yesterday", "Monday, February 14"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function getDateLabel(dateInput) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;

    if (diffMs < 86400000 && date.getDate() === now.getDate()) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()) {
        return 'Yesterday';
    }

    return date.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format "last seen" text.
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatLastSeen(dateInput) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    if (diffMin < 1) return 'last seen just now';
    if (diffMin < 60) return `last seen ${diffMin}m ago`;
    if (diffHr < 24) return `last seen ${diffHr}h ago`;
    return `last seen ${date.toLocaleDateString()}`;
}

/**
 * Check if a story has expired.
 * @param {string|Date} expiresAt
 * @returns {boolean}
 */
export function isStoryExpired(expiresAt) {
    return new Date(expiresAt) <= new Date();
}
