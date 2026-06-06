'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { pillBase, pillIdle } from '@/lib/uiStyles';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

interface ChallengeDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChallengeDatePicker({ value, onChange }: ChallengeDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseISO(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Challenge start date"
          className={cn(
            pillBase,
            pillIdle,
            'w-full h-9 sm:h-8 px-2.5 justify-between font-bold text-[11px] sm:text-[10px] uppercase tracking-wide shadow-none hover:shadow-none'
          )}
        >
          <span>{format(selectedDate, 'MMM d, yyyy')}</span>
          <CalendarDays className="shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-2 border-black rounded-xl shadow-lg font-mono"
        align="start"
        sideOffset={6}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          captionLayout="dropdown"
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, 'yyyy-MM-dd'));
            setOpen(false);
          }}
          className="rounded-xl"
        />
      </PopoverContent>
    </Popover>
  );
}
