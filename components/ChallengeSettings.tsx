'use client';

import { ChallengeDatePicker } from '@/components/ChallengeDatePicker';
import { Input } from '@/components/ui/input';
import {
  CHALLENGE_DURATION_PRESETS,
  getChallengeEndDate,
  getChallengeProgress,
  MAX_CHALLENGE_DAYS,
  MIN_CHALLENGE_DAYS,
} from '@/lib/challenge';
import { pillActive, pillBase, pillIdle } from '@/lib/uiStyles';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';
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

function getProgressLabel(challengeDays: number, progress: ReturnType<typeof getChallengeProgress>): string {
  if (progress.status === 'not-started') {
    const days = progress.daysUntilStart;
    return days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`;
  }
  if (progress.status === 'complete') {
    return 'Challenge complete';
  }
  return `Day ${progress.currentDay} of ${challengeDays}`;
}

function getProgressDetail(progress: ReturnType<typeof getChallengeProgress>): string | null {
  if (progress.status === 'active' && progress.daysRemaining > 0) {
    return progress.daysRemaining === 1 ? '1 day left' : `${progress.daysRemaining} days left`;
  }
  if (progress.status === 'active' && progress.daysRemaining === 0) {
    return 'Final day';
  }
  return null;
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
  const progress = getChallengeProgress(challengeStartDate, challengeDays);
  const progressDetail = getProgressDetail(progress);
  const [customDays, setCustomDays] = useState(String(challengeDays));
  const isPreset = CHALLENGE_DURATION_PRESETS.includes(
    challengeDays as (typeof CHALLENGE_DURATION_PRESETS)[number]
  );

  useEffect(() => {
    setCustomDays(String(challengeDays));
  }, [challengeDays]);

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
          {getProgressLabel(challengeDays, progress)}
        </p>
        <p className="text-[11px] sm:text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide">
          {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
        </p>
        {progressDetail && (
          <p className="text-[11px] sm:text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
            {progressDetail}
          </p>
        )}
      </div>

      <div>
        <p className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 mb-2">
          Started
        </p>
        <ChallengeDatePicker value={challengeStartDate} onChange={onStartDateChange} />
        {challengeStartDate !== today && (
          <button
            type="button"
            onClick={() => onStartDateChange(today)}
            className="mt-1.5 text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            Start today
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
