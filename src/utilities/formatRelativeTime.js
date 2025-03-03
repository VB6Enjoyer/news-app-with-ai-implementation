// Format time in relative terms to show the time passed since a news article was published
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    // Calculate difference in days
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate years and remaining days
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;

    // Format the date string
    const formattedDate = date.toISOString().split('T')[0];

    let relativeTime = '';

    if (years > 0) {
        relativeTime = `${years} year${years > 1 ? 's' : ''}`;
        if (remainingDays > 0) {
            relativeTime += ` & ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        }
    } else {
        relativeTime = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }

    return `Date: ${formattedDate} (${relativeTime} ago)`;
};

// Helper function to check if the date is valid
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

// Main export function with error handling
export const formatDate = (dateString) => {
    if (!dateString || !isValidDate(dateString)) {
        return 'Invalid date';
    }

    return formatRelativeTime(dateString);
};