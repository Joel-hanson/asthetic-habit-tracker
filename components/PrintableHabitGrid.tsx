'use client';

import { isCompleted } from '@/lib/storage';
import {
  A4_HEIGHT_PX,
  A4_PADDING_PX,
  A4_WIDTH_PX,
  buildPrintChunks,
  computePrintChunkSize,
  getPrintCellSize,
} from '@/lib/printableExport';
import { TrackerData } from '@/types/habit';
import { format, getDaysInMonth } from 'date-fns';
import { forwardRef } from 'react';

interface PrintableHabitGridProps {
  data: TrackerData;
}

export const PrintableHabitGrid = forwardRef<HTMLDivElement, PrintableHabitGridProps>(
  function PrintableHabitGrid({ data }, ref) {
    const currentDate = new Date();
    const year = parseInt(data.currentMonth.split('-')[0]);
    const month = parseInt(data.currentMonth.split('-')[1]) - 1;
    const daysInMonth = getDaysInMonth(new Date(year, month));
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthLabel = format(new Date(year, month), 'MMMM yyyy');

    const chunkSize = computePrintChunkSize(days.length);
    const cellSize = getPrintCellSize(chunkSize);
    const gap = 8;
    const labelWidth = 120;
    const chunks = buildPrintChunks(days, chunkSize);

    return (
      <div
        ref={ref}
        className="bg-white text-black"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          padding: `${A4_PADDING_PX}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0 0 24px',
            flexShrink: 0,
          }}
        >
          {monthLabel}
        </h1>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {data.habits.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>No habits tracked</p>
          ) : (
            chunks.map((chunk, chunkIdx) => (
              <div
                key={`print-chunk-${chunkIdx}`}
                style={{ marginBottom: chunkIdx < chunks.length - 1 ? '24px' : 0 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${gap}px`,
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: `${labelWidth}px`,
                      flexShrink: 0,
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#666',
                      textTransform: 'uppercase',
                    }}
                  >
                    Habit
                  </div>
                  <div style={{ display: 'flex', gap: `${gap}px` }}>
                    {chunk.map((day) => (
                      <div
                        key={day}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#666',
                          flexShrink: 0,
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {data.habits.map((habit) => (
                  <div
                    key={`${chunkIdx}-${habit.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${gap}px`,
                      marginBottom: '5px',
                    }}
                  >
                    <div
                      style={{
                        width: `${labelWidth}px`,
                        flexShrink: 0,
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {habit.name}
                    </div>
                    <div style={{ display: 'flex', gap: `${gap}px` }}>
                      {chunk.map((day) => {
                        const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
                        const completed = isCompleted(data, habit.id, dateStr);
                        const isFuture = new Date(year, month, day) > currentDate;

                        return (
                          <div
                            key={`${habit.id}-${day}`}
                            style={{
                              width: `${cellSize}px`,
                              height: `${cellSize}px`,
                              borderRadius: '9999px',
                              border: `2px solid ${completed ? '#000' : isFuture ? '#d1d5db' : '#000'}`,
                              backgroundColor: completed ? '#000' : '#fff',
                              flexShrink: 0,
                              boxSizing: 'border-box',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
);
