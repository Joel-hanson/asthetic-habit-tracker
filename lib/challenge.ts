import { TrackerData } from '@/types/habit';
import { addDays, differenceInCalendarDays, format, getDaysInMonth, parseISO, startOfDay } from 'date-fns';

export const CHALLENGE_DURATION_PRESETS = [7, 14, 21, 30, 60, 75, 90, 100] as const;
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

export interface GridDayLabel {
  day: string;
  month: string;
}

export function getGridDayLabel(startDate: string, day: number): GridDayLabel {
  const date = parseISO(getDateForChallengeDay(startDate, day));
  return {
    day: format(date, 'd'),
    month: format(date, 'MMM'),
  };
}

export function formatChallengeDayTitle(startDate: string, day: number): string {
  return format(parseISO(getDateForChallengeDay(startDate, day)), 'MMM d, yyyy');
}

export function getDateForChallengeDay(startDate: string, day: number): string {
  return format(addDays(parseISO(startDate), day - 1), 'yyyy-MM-dd');
}

export type ChallengeStatus = 'not-started' | 'active' | 'complete';

export interface ChallengeProgress {
  status: ChallengeStatus;
  currentDay: number | null;
  daysRemaining: number;
  daysUntilStart: number;
}

export function getChallengeProgress(
  startDate: string,
  totalDays: number,
  referenceDate: Date = new Date()
): ChallengeProgress {
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(getChallengeEndDate(startDate, totalDays)));
  const today = startOfDay(referenceDate);

  if (today < start) {
    return {
      status: 'not-started',
      currentDay: null,
      daysRemaining: totalDays,
      daysUntilStart: differenceInCalendarDays(start, today),
    };
  }

  if (today > end) {
    return {
      status: 'complete',
      currentDay: totalDays,
      daysRemaining: 0,
      daysUntilStart: 0,
    };
  }

  const currentDay = differenceInCalendarDays(today, start) + 1;
  return {
    status: 'active',
    currentDay,
    daysRemaining: totalDays - currentDay,
    daysUntilStart: 0,
  };
}

export function isChallengeDayToday(startDate: string, day: number, referenceDate: Date = new Date()): boolean {
  return getDateForChallengeDay(startDate, day) === format(referenceDate, 'yyyy-MM-dd');
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
