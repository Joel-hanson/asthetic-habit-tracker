'use client';

import { isCompleted } from '@/lib/storage';
import {
  getChallengeDayNumbers,
  getDateForChallengeDay,
  isChallengeDayFuture,
} from '@/lib/challenge';
import { TrackerData } from '@/types/habit';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface HabitGridProps {
  data: TrackerData;
  onToggleCompletion: (habitId: string, date: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const MIN_CHUNK = 7;

function getLayoutMetrics() {
  const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return {
    labelWidth: 6 * rootFont,
    cellWidth: 1.25 * rootFont,
    minGap: 0.75 * rootFont,
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

  if (remainder === 0 || remainder > 1) {
    if (remainder >= 2 && remainder <= 5) {
      const numRows = Math.ceil(totalDays / maxFit);
      const balanced = Math.ceil(totalDays / numRows);
      if (balanced >= MIN_CHUNK && balanced <= maxFit) return balanced;
    }
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
  }, [days.length]);

  const chunks = buildChunks(days, chunkSize);

  const isTouchingRef = useRef(false);
  const lastTouchedRef = useRef<string | null>(null);

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
      onToggleCompletion(habitId, date);
    }
    return touchedKey;
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
        <div className="p-3 sm:p-4">
          <div ref={contentRef} className="w-full">
            {chunks.map((chunk, chunkIdx) => (
              <div key={`chunk-${chunkIdx}`} className="mb-8 last:mb-0 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-24 text-sm font-bold shrink-0 text-gray-500 uppercase">Habit</div>
                  <div className="flex gap-3">
                    {chunk.map((day) => (
                      <div
                        key={day}
                        className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {data.habits.map((habit) => (
                  <div key={`${chunkIdx}-${habit.id}`} className="flex items-center gap-3 mb-1 group">
                    <div className="w-24 flex items-center justify-between shrink-0">
                      <span className="text-sm font-semibold truncate uppercase">{habit.name}</span>
                      {chunkIdx === 0 && (
                        <button
                          type="button"
                          onClick={() => onDeleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded ml-1"
                          title="Delete habit"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div
                      className="flex gap-3"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {chunk.map((day) => {
                        const dateStr = getDateForChallengeDay(challengeStartDate, day);
                        const completed = isCompleted(data, habit.id, dateStr);
                        const isFuture = isChallengeDayFuture(challengeStartDate, day);

                        return (
                          <button
                            key={`${habit.id}-${day}`}
                            type="button"
                            data-habit-id={habit.id}
                            data-date={dateStr}
                            onClick={() => !isFuture && onToggleCompletion(habit.id, dateStr)}
                            disabled={isFuture}
                            className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${
                              completed
                                ? 'bg-black border-black'
                                : isFuture
                                  ? 'bg-white border-gray-300'
                                  : 'bg-white border-black hover:bg-gray-50'
                            } ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            title={`${habit.name} - Day ${day}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
