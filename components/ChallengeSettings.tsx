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
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChallengeSettingsProps {
  challengeStartDate: string;
  challengeDays: number;
  onStartDateChange: (startDate: string) => void;
  onDurationChange: (days: number) => void;
}

function clampDays(days: number): number {
  return Math.min(MAX_CHALLENGE_DAYS, Math.max(MIN_CHALLENGE_DAYS, days));
}

export function ChallengeSettings({
  challengeStartDate,
  challengeDays,
  onStartDateChange,
  onDurationChange,
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
    <div className="w-full font-mono">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-0.5">
          Challenge
        </p>
        <p className="text-sm font-bold uppercase tracking-wide">
          {challengeDays} days
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide">
          {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
            Start
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-7 w-7 border-2 border-black/15 hover:border-black hover:bg-black hover:text-white cursor-pointer shrink-0 rounded-lg"
              title="Previous month"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>

            <p className="flex-1 text-center text-[11px] font-bold uppercase tracking-wide truncate">
              {format(startDate, 'MMM d, yyyy')}
            </p>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-7 w-7 border-2 border-black/15 hover:border-black hover:bg-black hover:text-white cursor-pointer shrink-0 rounded-lg"
              title="Next month"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          {challengeStartDate !== today && (
            <button
              type="button"
              onClick={() => onStartDateChange(today)}
              className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              Reset to today
            </button>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
            Length
          </p>
          <div className="grid grid-cols-4 gap-1">
            {CHALLENGE_DURATION_PRESETS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handlePreset(days)}
                className={`${pillBase} h-8 text-[10px] ${challengeDays === days ? pillActive : pillIdle}`}
              >
                {days}d
              </button>
            ))}
            <Input
              type="number"
              min={MIN_CHALLENGE_DAYS}
              max={MAX_CHALLENGE_DAYS}
              value={customDays}
              onChange={(e) => handleCustomDaysChange(e.target.value)}
              onBlur={handleCustomDaysBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomDaysBlur()}
              aria-label="Custom challenge length in days"
              className={`${pillBase} h-8 px-0.5 text-[10px] text-center focus:ring-0 focus:ring-offset-0 ${
                !isPreset ? pillActive : pillIdle
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
