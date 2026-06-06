export interface Habit {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
}

export interface MemorableMoment {
  id: string;
  date: string; // YYYY-MM-DD format
  content: string;
}

export interface TrackerData {
  habits: Habit[];
  completions: HabitCompletion[];
  moments: MemorableMoment[];
  currentMonth: string; // YYYY-MM format (legacy, kept for compatibility)
  challengeStartDate: string; // YYYY-MM-DD — first day of the challenge
  challengeDays: number; // total days in the challenge grid
}

