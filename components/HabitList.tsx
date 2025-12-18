'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Habit } from '@/types/habit';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface HabitListProps {
  habits: Habit[];
  onAddHabit: (name: string, color: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
];

export function HabitList({ habits, onAddHabit, onDeleteHabit }: HabitListProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAddHabit(newHabitName.trim(), selectedColor);
      setNewHabitName('');
      setSelectedColor(PRESET_COLORS[0]);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Habits</h3>
        {!isAdding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="h-8 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
          <Input
            placeholder="e.g., Morning run, Read 30 min"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            autoFocus
            className="h-9"
          />
          <div className="flex gap-1.5 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-md transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                  }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddHabit} size="sm" className="flex-1 h-8 cursor-pointer">
              Add Habit
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewHabitName('');
              }}
              size="sm"
              variant="outline"
              className="h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {habits.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No habits yet
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-card group hover:bg-accent transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
            <span className="flex-1 text-sm font-medium truncate">{habit.name}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteHabit(habit.id)}
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
