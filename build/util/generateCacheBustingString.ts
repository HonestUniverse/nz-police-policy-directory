export function generateCacheBustingString(): string {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

	const msSinceYearStart = Number(now) - Number(yearStart);
	const minutesSinceYearStart = Math.floor(msSinceYearStart / 60000);

	const cacheBustingString = minutesSinceYearStart.toString(16);
	return cacheBustingString;
}
