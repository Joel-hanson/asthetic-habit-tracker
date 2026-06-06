'use client';

import { isCompleted } from '@/lib/storage';
import {
  formatChallengeDayTitle,
  getChallengeDayNumbers,
  getDateForChallengeDay,
  getGridDayLabel,
  isChallengeDayFuture,
  isChallengeDayToday,
} from '@/lib/challenge';
import { TrackerData } from '@/types/habit';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface HabitGridProps {
  data: TrackerData;
  onToggleCompletion: (habitId: string, date: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const MIN_CHUNK = 7;
const DELETE_HINT_KEY = 'habit-tracker-hold-to-delete-hint';

function getLayoutMetrics() {
  const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const isMobile = window.matchMedia('(max-width: 639px)').matches;
  return {
    labelWidth: (isMobile ? 5 : 6) * rootFont,
    cellWidth: (isMobile ? 1.375 : 1.25) * rootFont,
    minGap: (isMobile ? 0.375 : 0.75) * rootFont,
  };
}

function measureMaxFit(contentWidth: number, totalDays: number): number {
  const { labelWidth, cellWidth, minGap } = getLayoutMetrics();

  for (let n = totalDays; n >= MIN_CHUNK; n--) {
    const rowWidth = labelWidth + n * cellWidth + n * minGap;
    if (rowWidth <= contentWidth) return n;
  }
  return MIN_CHUNK;
}

/** Pick chunk size: fit as many days as possible, balance rows when a tail would be tiny. */
function resolveChunkSize(maxFit: number, totalDays: number): number {
  if (totalDays <= maxFit) return totalDays;

  const remainder = totalDays % maxFit;

  if (remainder > 0 && remainder <= 2) {
    for (let size = maxFit - 1; size >= MIN_CHUNK; size--) {
      const tail = totalDays % size;
      if (tail === 0 || tail >= 3) return size;
    }
  }

  if (remainder !== 0 && remainder !== 1) {
    const numRows = Math.ceil(totalDays / maxFit);
    const balanced = Math.ceil(totalDays / numRows);
    if (balanced >= MIN_CHUNK && balanced <= maxFit) return balanced;
  }

  if (remainder === 0 || remainder > 1) {
    return maxFit;
  }

  if (maxFit - 1 >= MIN_CHUNK && totalDays % (maxFit - 1) !== 1) {
    return maxFit - 1;
  }

  return Math.max(MIN_CHUNK, Math.ceil(totalDays / Math.ceil(totalDays / maxFit)));
}

function buildChunks(days: number[], chunkSize: number): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < days.length; i += chunkSize) {
    chunks.push(days.slice(i, i + chunkSize));
  }
  return chunks;
}

export function HabitGrid({ data, onToggleCompletion, onDeleteHabit }: HabitGridProps) {
  const { challengeStartDate, challengeDays } = data;
  const days = getChallengeDayNumbers(challengeDays);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [chunkSize, setChunkSize] = useState<number>(days.length);
  const [showDeleteHint, setShowDeleteHint] = useState(false);
  const isTouchingRef = useRef(false);
  const lastTouchedRef = useRef<string | null>(null);
  const suppressClickRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const labelTouchRef = useRef<{ x: number; y: number } | null>(null);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const dismissDeleteHint = () => {
    localStorage.setItem(DELETE_HINT_KEY, 'true');
    setShowDeleteHint(false);
  };

  useEffect(() => {
    setShowDeleteHint(localStorage.getItem(DELETE_HINT_KEY) !== 'true');
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const maxFit = measureMaxFit(el.clientWidth, days.length);
      setChunkSize(resolveChunkSize(maxFit, days.length));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [days.length, data.habits.length]);

  useEffect(() => () => clearLongPress(), []);

  const chunks = buildChunks(days, chunkSize);

  const handleLabelTouchStart = (habitId: string) => (e: React.TouchEvent) => {
    const touch = e.touches[0];
    labelTouchRef.current = { x: touch.clientX, y: touch.clientY };
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      navigator.vibrate?.(50);
      dismissDeleteHint();
      onDeleteHabit(habitId);
    }, 500);
  };

  const handleLabelTouchMove = (e: React.TouchEvent) => {
    const start = labelTouchRef.current;
    if (!start) return;
    const touch = e.touches[0];
    if (Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 10) {
      clearLongPress();
    }
  };

  const handleLabelTouchEnd = () => {
    clearLongPress();
    labelTouchRef.current = null;
  };

  const handleTouch = (touch: React.Touch | null, event?: React.TouchEvent) => {
    if (!touch) return null;
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    if (!el) return null;
    const btn = el.closest('button[data-date]') as HTMLButtonElement | null;
    if (!btn) return null;
    const date = btn.getAttribute('data-date');
    const habitId = btn.getAttribute('data-habit-id');
    if (!date || !habitId) return null;
    const touchedKey = `${habitId}:${date}`;
    if (lastTouchedRef.current === touchedKey) return null;
    lastTouchedRef.current = touchedKey;
    if (event?.cancelable) event.preventDefault();
    if (!btn.disabled) {
      suppressClickRef.current = true;
      onToggleCompletion(habitId, date);
    }
    return touchedKey;
  };

  const handleCellClick = (habitId: string, dateStr: string, isFuture: boolean) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (!isFuture) {
      onToggleCompletion(habitId, dateStr);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isTouchingRef.current = true;
    lastTouchedRef.current = null;
    handleTouch(e.touches[0], e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchingRef.current) return;
    handleTouch(e.touches[0]);
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    lastTouchedRef.current = null;
    // iOS may suppress the ghost click after a swipe; reset if no click follows.
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 400);
  };

  return (
    <div
      className="w-full bg-white"
      style={{ fontFamily: 'monospace', touchAction: 'manipulation' }}
    >
      {data.habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-bold tracking-wide mb-2">NO HABITS YET</p>
          <p className="text-xs text-gray-600">Click &apos;ADD HABIT&apos; to get started</p>
        </div>
      ) : (
        <div className="pt-2 sm:p-4">
          {showDeleteHint && (
            <div className="sm:hidden flex items-center justify-between gap-2 mb-2 px-0.5">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Hold habit name to delete
              </p>
              <button
                type="button"
                onClick={dismissDeleteHint}
                className="text-gray-400 active:text-gray-600 p-0.5 shrink-0"
                aria-label="Dismiss hint"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div ref={contentRef} className="w-full">
            <div className="w-full max-sm:w-full sm:w-fit">
            {chunks.map((chunk, chunkIdx) => {
              const isFullRow = chunk.length === chunkSize;
              const rowWidth = isFullRow ? 'max-sm:w-full sm:w-fit' : 'w-fit max-w-full';
              const daysLayout = isFullRow
                ? 'max-sm:flex-1 max-sm:justify-between max-sm:gap-0 max-sm:min-w-0 sm:gap-3 sm:shrink-0'
                : 'gap-1.5 sm:gap-3 shrink-0';
              const cellLayout = isFullRow
                ? 'max-sm:flex-1 max-sm:w-auto w-[1.375rem] sm:w-5'
                : 'w-[1.375rem] sm:w-5';

              return (
              <div key={`chunk-${chunkIdx}`} className={cn('mb-5 sm:mb-8 last:mb-0', rowWidth)}>
                <div className={cn('flex items-center gap-2 sm:gap-3 mb-2', rowWidth)}>
                  <div className="w-20 sm:w-24 text-xs sm:text-sm font-bold shrink-0 text-gray-500 uppercase">
                    Habit
                  </div>
                  <div className={cn('flex', daysLayout)}>
                    {chunk.map((day) => {
                      const { day: dayOfMonth, month } = getGridDayLabel(challengeStartDate, day);
                      const isToday = isChallengeDayToday(challengeStartDate, day);

                      return (
                        <div
                          key={day}
                          className={cn(
                            'flex flex-col items-center justify-center leading-none shrink-0',
                            isToday ? 'text-black' : 'text-gray-500',
                            cellLayout
                          )}
                        >
                          <span
                            className={cn(
                              'text-xs sm:text-sm font-semibold',
                              isToday && 'underline underline-offset-2 decoration-2'
                            )}
                          >
                            {dayOfMonth}
                          </span>
                          <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-tight mt-0.5">
                            {month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {data.habits.map((habit) => (
                  <div
                    key={`${chunkIdx}-${habit.id}`}
                    className={cn('flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-1 group', rowWidth)}
                  >
                    <div className="w-20 sm:w-24 flex items-center justify-between shrink-0 min-w-0">
                      <span
                        className="text-xs sm:text-sm font-semibold truncate uppercase select-none sm:select-auto"
                        aria-label={habit.name}
                        onTouchStart={handleLabelTouchStart(habit.id)}
                        onTouchMove={handleLabelTouchMove}
                        onTouchEnd={handleLabelTouchEnd}
                        onTouchCancel={handleLabelTouchEnd}
                      >
                        {habit.name}
                      </span>
                      {chunkIdx === 0 && (
                        <button
                          type="button"
                          onClick={() => onDeleteHabit(habit.id)}
                          className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded shrink-0"
                          title="Delete habit"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div
                      className={cn('flex', daysLayout)}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {chunk.map((day) => {
                        const dateStr = getDateForChallengeDay(challengeStartDate, day);
                        const completed = isCompleted(data, habit.id, dateStr);
                        const isFuture = isChallengeDayFuture(challengeStartDate, day);
                        const isToday = isChallengeDayToday(challengeStartDate, day);

                        return (
                          <div key={`${habit.id}-${day}`} className={cn('flex justify-center shrink-0', cellLayout)}>
                            <button
                              type="button"
                              data-habit-id={habit.id}
                              data-date={dateStr}
                              onClick={() => handleCellClick(habit.id, dateStr, isFuture)}
                              disabled={isFuture}
                              className={cn(
                                'w-[1.375rem] h-[1.375rem] sm:w-5 sm:h-5 rounded-full border-2 transition-all shrink-0',
                                completed
                                  ? 'bg-black border-black'
                                  : isFuture
                                    ? 'bg-white border-gray-300'
                                    : 'bg-white border-black hover:bg-gray-50',
                                isToday && !completed && !isFuture && 'ring-2 ring-black/25 ring-offset-1',
                                isFuture ? 'cursor-not-allowed' : 'cursor-pointer'
                              )}
                              title={`${habit.name} - ${formatChallengeDayTitle(challengeStartDate, day)}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
            })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
