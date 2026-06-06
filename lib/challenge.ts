import { TrackerData } from '@/types/habit';
import { addDays, format, getDaysInMonth, parseISO, startOfDay } from 'date-fns';

export const CHALLENGE_DURATION_PRESETS = [7, 14, 21, 30, 60, 90, 100] as const;
export const MIN_CHALLENGE_DAYS = 1;
export const MAX_CHALLENGE_DAYS = 365;

export function normalizeTrackerData(data: TrackerData): TrackerData {
  if (data.challengeStartDate && data.challengeDays) {
    return data;
  }

  const [year, month] = data.currentMonth.split('-').map(Number);
  const startDate = `${data.currentMonth}-01`;
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));

  return {
    ...data,
    challengeStartDate: startDate,
    challengeDays: daysInMonth,
  };
}

export function getChallengeDayNumbers(totalDays: number): number[] {
  return Array.from({ length: totalDays }, (_, i) => i + 1);
}

export function getDateForChallengeDay(startDate: string, day: number): string {
  return format(addDays(parseISO(startDate), day - 1), 'yyyy-MM-dd');
}

export function isChallengeDayFuture(startDate: string, day: number): boolean {
  const date = startOfDay(parseISO(getDateForChallengeDay(startDate, day)));
  return date > startOfDay(new Date());
}

export function getChallengeEndDate(startDate: string, totalDays: number): string {
  return getDateForChallengeDay(startDate, totalDays);
}

export function getChallengeLabel(data: TrackerData): string {
  const start = parseISO(data.challengeStartDate);
  const end = parseISO(getChallengeEndDate(data.challengeStartDate, data.challengeDays));

  if (data.challengeDays <= 31) {
    return `${data.challengeDays}-Day Challenge · ${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }

  return `${data.challengeDays}-Day Challenge · ${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export function getChallengeExportSlug(data: TrackerData): string {
  return `${data.challengeDays}d-${data.challengeStartDate}`;
}
