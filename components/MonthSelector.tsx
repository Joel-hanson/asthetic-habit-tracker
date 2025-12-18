'use client';

import { Button } from '@/components/ui/button';
import { addMonths, format, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  currentMonth: string; // YYYY-MM format
  onMonthChange: (month: string) => void;
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const [year, month] = currentMonth.split('-').map(Number);
  const date = new Date(year, month - 1);

  const handlePrevMonth = () => {
    const newDate = subMonths(date, 1);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(date, 1);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const handleToday = () => {
    onMonthChange(format(new Date(), 'yyyy-MM'));
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 font-mono w-full sm:w-auto">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          className="h-7 w-7 sm:h-9 sm:w-9 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <h2 className="text-sm sm:text-2xl font-bold uppercase tracking-wider min-w-0 sm:min-w-[240px] text-center flex-1">
          {format(date, 'MMMM yyyy')}
        </h2>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="h-7 w-7 sm:h-9 sm:w-9 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>

      {format(new Date(), 'yyyy-MM') !== currentMonth && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="border-2 border-black hover:bg-black hover:text-white font-bold text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-9 cursor-pointer"
        >
          TODAY
        </Button>
      )}
    </div>
  );
}
