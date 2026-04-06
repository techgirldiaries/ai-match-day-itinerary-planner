/**
 * Lightweight time-ago formatter for displaying relative timestamps
 * e.g., "2 minutes ago", "3 hours ago", etc.
 */

function getTimeAgoString(date: number | string | Date): string {
	const now = new Date();
	const timestamp = new Date(date);
	const secondsAgo = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

	if (secondsAgo < 60) {
		return secondsAgo <= 1 ? "just now" : `${secondsAgo} seconds ago`;
	}

	const minutesAgo = Math.floor(secondsAgo / 60);
	if (minutesAgo < 60) {
		return minutesAgo === 1 ? "1 minute ago" : `${minutesAgo} minutes ago`;
	}

	const hoursAgo = Math.floor(minutesAgo / 60);
	if (hoursAgo < 24) {
		return hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;
	}

	const daysAgo = Math.floor(hoursAgo / 24);
	if (daysAgo < 7) {
		return daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
	}

	const weeksAgo = Math.floor(daysAgo / 7);
	if (weeksAgo < 4) {
		return weeksAgo === 1 ? "1 week ago" : `${weeksAgo} weeks ago`;
	}

	const monthsAgo = Math.floor(daysAgo / 30);
	return monthsAgo === 1 ? "1 month ago" : `${monthsAgo} months ago`;
}

interface TimeAgoProps {
	date: number | string | Date;
	title?: string;
}

/**
 * A lightweight time-ago component that displays relative time
 * Component updates every 60 seconds to keep the display current
 */
export function TimeAgo({ date, title }: TimeAgoProps) {
	const timeString = getTimeAgoString(date);

	return <time title={title}>{timeString}</time>;
}

export default TimeAgo;
