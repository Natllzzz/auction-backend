const SNIPING_WINDOW_MS = 10_000;
const EXTENSION_MS = 15_000;

export function shouldExtendRound(roundScheduledEnd: Date, bidTime: Date): boolean {
  const timeToClose = roundScheduledEnd.getTime() - bidTime.getTime();
  return timeToClose > 0 && timeToClose <= SNIPING_WINDOW_MS;
}

export function extendRoundEndTime(currentEnd: Date): Date {
  return new Date(currentEnd.getTime() + EXTENSION_MS);
}