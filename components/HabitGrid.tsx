'use client';

import { isCompleted } from '@/lib/storage';
import { TrackerData } from '@/types/habit';
import { format, getDaysInMonth } from 'date-fns';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface HabitGridProps {
  data: TrackerData;
  onToggleCompletion: (habitId: string, date: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export function HabitGrid({ data, onToggleCompletion, onDeleteHabit }: HabitGridProps) {
  const currentDate = new Date();
  const year = parseInt(data.currentMonth.split('-')[0]);
  const month = parseInt(data.currentMonth.split('-')[1]) - 1;
  const daysInMonth = getDaysInMonth(new Date(year, month));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chunkSize, setChunkSize] = useState<number>(13);

  useEffect(() => {
    const computeChunkSize = () => {
      const containerWidth = containerRef.current?.clientWidth ?? window.innerWidth;
      const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const labelWidth = 6 * rootFont; // Tailwind `w-24` => 6rem
      const cellWidth = 1.7 * rootFont; // Tailwind `w-5` => 1.75rem
      const gap = 0.75 * rootFont; // Tailwind `gap-3` => 0.75rem
      const extraPadding = 48; // a small buffer for paddings/margins

      const available = containerWidth - labelWidth - extraPadding;
      const perCell = cellWidth + gap;
      const count = Math.floor(available / perCell) || 1;

      // enforce sensible bounds
      const min = 7;
      const max = days.length;
      const size = Math.max(min, Math.min(max, count));
      setChunkSize(size);
    };

    computeChunkSize();
    window.addEventListener('resize', computeChunkSize);
    return () => window.removeEventListener('resize', computeChunkSize);
  }, [days.length]);

  const chunks: number[][] = [];
  for (let i = 0; i < days.length; i += chunkSize) {
    chunks.push(days.slice(i, i + chunkSize));
  }

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
    <div ref={containerRef} className="w-full h-full bg-white overflow-auto" style={{ fontFamily: 'monospace', touchAction: 'manipulation' }}>
      {data.habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-bold tracking-wide mb-2">NO HABITS YET</p>
          <p className="text-xs text-gray-600">Click &apos;ADD HABIT&apos; to get started</p>
        </div>
      ) : (
        <div className="p-6">
          {chunks.map((chunk, chunkIdx) => (
            <div key={`chunk-${chunkIdx}`} className="mb-8">
              {/* Header row: "Habit" label + day numbers */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-24 text-sm font-bold shrink-0 text-gray-500 uppercase">Habit</div>
                <div className="flex gap-3 text-gray-500">
                  {chunk.map((day) => (
                    <div
                      key={day}
                      className="w-5 h-5 flex items-center justify-center text-sm font-semibold shrink-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* One data row per habit */}
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
                      const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
                      const completed = isCompleted(data, habit.id, dateStr);
                      const isFuture = new Date(year, month, day) > currentDate;

                      return (
                        <button
                          key={`${habit.id}-${day}`}
                          type="button"
                          data-habit-id={habit.id}
                          data-date={dateStr}
                          onClick={() => !isFuture && onToggleCompletion(habit.id, dateStr)}
                          disabled={isFuture}
                          className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${completed
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
      )}
    </div>
  );
}