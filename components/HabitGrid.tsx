'use client';

import { isCompleted } from '@/lib/storage';
import { TrackerData } from '@/types/habit';
import { format, getDaysInMonth } from 'date-fns';
import { X } from 'lucide-react';

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const header = e.currentTarget.previousElementSibling as HTMLElement;
    if (header) {
      header.scrollLeft = scrollLeft;
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col font-mono">
      {data.habits.length === 0 ? (
        <div className="text-center py-8 sm:py-16 text-black">
          <p className="text-xs sm:text-sm mb-1 font-bold">NO HABITS YET</p>
          <p className="text-[10px] sm:text-xs">Click &quot;ADD HABIT&quot; to get started</p>
        </div>
      ) : (
        <div className="border-2 border-black overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Header with day numbers */}
          <div className="flex gap-0 border-b-2 border-black shrink-0 bg-black text-white overflow-x-auto scrollbar-hide">
            <div className="w-20 sm:w-40 border-r-2 border-white px-1 sm:px-3 py-1.5 sm:py-2.5 font-bold text-[8px] sm:text-xs flex items-center justify-center sm:justify-start tracking-wide sticky left-0 bg-black z-10">
              HABIT
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="flex-1 min-w-[28px] sm:min-w-0 h-7 sm:h-10 flex items-center justify-center text-[8px] sm:text-[11px] font-bold border-r border-white last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Habit rows */}
          <div className="flex-1 overflow-y-auto overflow-x-auto flex flex-col" onScroll={handleScroll}>
            {data.habits.map((habit) => (
              <div
                key={habit.id}
                className={`flex gap-0 items-stretch group border-b border-black hover:bg-gray-50`}
              >
                {/* Habit name */}
                <div className="w-20 sm:w-40 px-1 sm:px-3 flex items-center justify-center sm:justify-between gap-1 sm:gap-2 py-1.5 sm:py-2.5 border-r-2 border-black sticky left-0 bg-white z-10">
                  <span className="text-[8px] sm:text-[11px] truncate font-bold uppercase text-center sm:text-left">
                    {habit.name}
                  </span>
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-black hover:text-white border border-black hidden sm:block shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Completion checkboxes */}
                <div className="flex gap-0 flex-1">
                  {days.map((day, dayIndex) => {
                    const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
                    const completed = isCompleted(data, habit.id, dateStr);
                    const isFuture = new Date(year, month, day) > currentDate;

                    return (
                      <button
                        key={day}
                        onClick={() => !isFuture && onToggleCompletion(habit.id, dateStr)}
                        disabled={isFuture}
                        className={`
                          flex-1 min-w-[28px] sm:min-w-0 h-8 sm:h-11 flex items-center justify-center
                          transition-all duration-150 relative
                          ${dayIndex !== days.length - 1 ? 'border-r border-black' : ''}
                          ${isFuture ? 'opacity-20 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-100'}
                        `}
                      >
                        {completed && (
                          <span className="text-black text-sm sm:text-xl font-extrabold leading-none">✕</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Empty filler row to extend grid lines to bottom */}
            <div className="flex-1 flex gap-0">
              <div className="w-20 sm:w-40 border-r-2 border-gray-200 sticky left-0 bg-white"></div>
              {days.map((day, dayIndex) => (
                <div
                  key={day}
                  className={`flex-1 min-w-[28px] sm:min-w-0 ${dayIndex !== days.length - 1 ? 'border-r border-gray-200' : ''}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
