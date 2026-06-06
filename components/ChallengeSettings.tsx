'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CHALLENGE_DURATION_PRESETS,
  getChallengeEndDate,
  MAX_CHALLENGE_DAYS,
  MIN_CHALLENGE_DAYS,
} from '@/lib/challenge';
import { pillActive, pillBase, pillIdle } from '@/lib/uiStyles';
import { cn } from '@/lib/utils';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChallengeSettingsProps {
  challengeStartDate: string;
  challengeDays: number;
  onStartDateChange: (startDate: string) => void;
  onDurationChange: (days: number) => void;
  mobileExtrasExpanded?: boolean;
  onToggleMobileExtras?: () => void;
}

function clampDays(days: number): number {
  return Math.min(MAX_CHALLENGE_DAYS, Math.max(MIN_CHALLENGE_DAYS, days));
}

export function ChallengeSettings({
  challengeStartDate,
  challengeDays,
  onStartDateChange,
  onDurationChange,
  mobileExtrasExpanded = true,
  onToggleMobileExtras,
}: ChallengeSettingsProps) {
  const startDate = parseISO(challengeStartDate);
  const endDate = parseISO(getChallengeEndDate(challengeStartDate, challengeDays));
  const today = format(new Date(), 'yyyy-MM-dd');
  const [customDays, setCustomDays] = useState(String(challengeDays));
  const isPreset = CHALLENGE_DURATION_PRESETS.includes(
    challengeDays as (typeof CHALLENGE_DURATION_PRESETS)[number]
  );

  useEffect(() => {
    setCustomDays(String(challengeDays));
  }, [challengeDays]);

  const handlePrevMonth = () => {
    onStartDateChange(format(subMonths(startDate, 1), 'yyyy-MM-dd'));
  };

  const handleNextMonth = () => {
    onStartDateChange(format(addMonths(startDate, 1), 'yyyy-MM-dd'));
  };

  const handlePreset = (days: number) => {
    setCustomDays(String(days));
    onDurationChange(days);
  };

  const handleCustomDaysChange = (value: string) => {
    setCustomDays(value);
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      onDurationChange(clampDays(parsed));
    }
  };

  const handleCustomDaysBlur = () => {
    const parsed = parseInt(customDays, 10);
    const clamped = clampDays(Number.isNaN(parsed) ? challengeDays : parsed);
    setCustomDays(String(clamped));
    onDurationChange(clamped);
  };

  return (
    <div className="w-full font-mono space-y-4">
      <div>
        <p className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 mb-0.5">
          Challenge
        </p>
        <p className="text-base sm:text-sm font-bold uppercase tracking-wide">
          {challengeDays} days
        </p>
        <p className="text-[11px] sm:text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide">
          {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
        </p>
      </div>

      <div>
        <p className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 mb-2">
          Start
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-9 w-9 sm:h-7 sm:w-7 border-2 border-black/15 hover:border-black hover:bg-black hover:text-white cursor-pointer shrink-0 rounded-lg"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4 sm:w-3 sm:h-3" />
          </Button>

          <p className="flex-1 text-center text-xs sm:text-[11px] font-bold uppercase tracking-wide truncate">
            {format(startDate, 'MMM d, yyyy')}
          </p>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-9 w-9 sm:h-7 sm:w-7 border-2 border-black/15 hover:border-black hover:bg-black hover:text-white cursor-pointer shrink-0 rounded-lg"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3" />
          </Button>
        </div>

        {challengeStartDate !== today && (
          <button
            type="button"
            onClick={() => onStartDateChange(today)}
            className="mt-1.5 text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            Reset to today
          </button>
        )}
      </div>

      {onToggleMobileExtras && (
        <button
          type="button"
          onClick={onToggleMobileExtras}
          className="md:hidden flex items-center justify-between w-full py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 hover:text-black transition-colors cursor-pointer"
          aria-expanded={mobileExtrasExpanded}
        >
          <span>{mobileExtrasExpanded ? 'Hide length & actions' : 'Show length & actions'}</span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', mobileExtrasExpanded && 'rotate-180')}
          />
        </button>
      )}

      <div className={cn(onToggleMobileExtras && !mobileExtrasExpanded && 'max-md:hidden')}>
        <p className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 mb-2">
          Length
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {CHALLENGE_DURATION_PRESETS.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => handlePreset(days)}
              className={`${pillBase} h-9 sm:h-8 text-[11px] sm:text-[10px] ${challengeDays === days ? pillActive : pillIdle}`}
            >
              {days}d
            </button>
          ))}
        </div>
        <div className="relative mt-1.5">
          <Input
            type="number"
            min={MIN_CHALLENGE_DAYS}
            max={MAX_CHALLENGE_DAYS}
            value={customDays}
            onChange={(e) => handleCustomDaysChange(e.target.value)}
            onBlur={handleCustomDaysBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomDaysBlur()}
            aria-label="Custom challenge length in days"
            className={`${pillBase} w-full h-9 sm:h-8 pr-6 pl-2 text-[10px] sm:text-[10px] md:text-[10px] text-left md:text-center focus:ring-0 focus:ring-offset-0 ${!isPreset ? pillActive : pillIdle
              }`}
          />
          <span
            className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase ${!isPreset ? 'text-white' : 'text-gray-400'
              }`}
          >
            days
          </span>
        </div>
      </div>
    </div>
  );
}
