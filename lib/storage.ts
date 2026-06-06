import { normalizeTrackerData } from '@/lib/challenge';
import { TrackerData, Habit, HabitCompletion, MemorableMoment } from '@/types/habit';
import { format } from 'date-fns';

export const STORAGE_KEY = 'habit-tracker-data';

function isTrackerData(value: unknown): value is TrackerData {
  if (!value || typeof value !== 'object') return false;
  const data = value as TrackerData;
  return (
    Array.isArray(data.habits) &&
    Array.isArray(data.completions) &&
    Array.isArray(data.moments)
  );
}

export const getDefaultData = (): TrackerData => {
  const currentMonth = format(new Date(), 'yyyy-MM');
  return normalizeTrackerData({
    habits: [],
    completions: [],
    moments: [],
    currentMonth,
    challengeStartDate: format(new Date(), 'yyyy-MM-dd'),
    challengeDays: 30,
  });
};

export const loadData = (): TrackerData => {
  if (typeof window === 'undefined') return getDefaultData();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultData();
    return normalizeTrackerData(JSON.parse(stored));
  } catch (error) {
    console.error('Error loading data:', error);
    return getDefaultData();
  }
};

export const saveData = (data: TrackerData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const serializeData = (data: TrackerData): string => {
  return JSON.stringify(data, null, 2);
};

export const parseImportedData = (raw: string): TrackerData => {
  const parsed: unknown = JSON.parse(raw);
  if (!isTrackerData(parsed)) {
    throw new Error('Invalid backup file. Expected habits, completions, and moments.');
  }
  return normalizeTrackerData(parsed);
};

export const clearStoredData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const addHabit = (data: TrackerData, habit: Habit): TrackerData => {
  return {
    ...data,
    habits: [...data.habits, habit],
  };
};

export const updateHabit = (data: TrackerData, habitId: string, updates: Partial<Habit>): TrackerData => {
  return {
    ...data,
    habits: data.habits.map(h => h.id === habitId ? { ...h, ...updates } : h),
  };
};

export const deleteHabit = (data: TrackerData, habitId: string): TrackerData => {
  return {
    ...data,
    habits: data.habits.filter(h => h.id !== habitId),
    completions: data.completions.filter(c => c.habitId !== habitId),
  };
};

export const toggleCompletion = (data: TrackerData, habitId: string, date: string): TrackerData => {
  const exists = data.completions.some(c => c.habitId === habitId && c.date === date);
  
  if (exists) {
    return {
      ...data,
      completions: data.completions.filter(c => !(c.habitId === habitId && c.date === date)),
    };
  } else {
    return {
      ...data,
      completions: [...data.completions, { habitId, date }],
    };
  }
};

export const isCompleted = (data: TrackerData, habitId: string, date: string): boolean => {
  return data.completions.some(c => c.habitId === habitId && c.date === date);
};

export const addMoment = (data: TrackerData, moment: MemorableMoment): TrackerData => {
  return {
    ...data,
    moments: [...data.moments, moment],
  };
};

export const updateMoment = (data: TrackerData, momentId: string, content: string): TrackerData => {
  return {
    ...data,
    moments: data.moments.map(m => m.id === momentId ? { ...m, content } : m),
  };
};

export const deleteMoment = (data: TrackerData, momentId: string): TrackerData => {
  return {
    ...data,
    moments: data.moments.filter(m => m.id !== momentId),
  };
};

