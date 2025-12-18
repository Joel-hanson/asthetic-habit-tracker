'use client';

import { HabitGrid } from '@/components/HabitGrid';
import { MonthSelector } from '@/components/MonthSelector';
import { ShareButton } from '@/components/ShareButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  addHabit as addHabitToData,
  deleteHabit as deleteHabitFromData,
  loadData,
  saveData,
  toggleCompletion as toggleCompletionInData,
} from '@/lib/storage';
import { Habit, TrackerData } from '@/types/habit';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  // ⚠️ CHANGE 1: Remove lazy initializer - start with null
  const [data, setData] = useState<TrackerData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // ⚠️ CHANGE 2: Load data only on client side in useEffect
  useEffect(() => {
    setData(loadData());
  }, []);

  useEffect(() => {
    if (data) {
      saveData(data);
    }
  }, [data]);

  // ⚠️ CHANGE 3: Make loading state match main container structure
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 overflow-hidden font-mono">
        <div className="animate-pulse text-black">Loading...</div>
      </div>
    );
  }

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: newHabitName.trim(),
        color: '#000000',
        order: data.habits.length,
      };
      setData(addHabitToData(data, newHabit));
      setNewHabitName('');
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabitToDelete(habitId);
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      setData(deleteHabitFromData(data, habitToDelete));
      setHabitToDelete(null);
    }
  };

  const handleToggleCompletion = (habitId: string, date: string) => {
    setData(toggleCompletionInData(data, habitId, date));
  };

  const handleMonthChange = (month: string) => {
    setData({ ...data, currentMonth: month });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 overflow-hidden font-mono">
      <div className="w-full max-w-6xl h-[98vh] sm:h-[95vh]">
        <Card className="p-3 sm:p-6 border-2 border-black h-full flex flex-col overflow-hidden bg-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 shrink-0 pb-3 sm:pb-4 border-b-2 border-black gap-3 sm:gap-0">
            <MonthSelector
              currentMonth={data.currentMonth}
              onMonthChange={handleMonthChange}
            />

            <div className="flex gap-2 w-full sm:w-auto">
              <ShareButton gridRef={gridRef} monthYear={data.currentMonth} />

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-black hover:bg-black hover:text-white font-bold text-xs sm:text-sm w-full sm:w-auto cursor-pointer"
                  >
                    + ADD HABIT
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-2 border-black font-mono">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase">Add New Habit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Enter habit name..."
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                      className="border-2 border-black focus:ring-0 focus:ring-offset-0 uppercase"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddHabit}
                        className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
                      >
                        ADD
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setNewHabitName('');
                        }}
                        variant="outline"
                        className="border-2 border-black hover:bg-black hover:text-white font-bold"
                      >
                        CANCEL
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <div ref={gridRef} className="h-full flex flex-col bg-white">
              {/* Month/Year header for exported image */}
              <div className="text-center py-4 border-b-2 border-black">
                <h2 className="text-2xl font-bold uppercase tracking-wider">
                  {new Date(data.currentMonth).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>
              </div>
              <HabitGrid
                data={data}
                onToggleCompletion={handleToggleCompletion}
                onDeleteHabit={handleDeleteHabit}
              />
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent className="border-2 border-black font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold uppercase">Delete Habit</AlertDialogTitle>
            <AlertDialogDescription className="text-black">
              Are you sure you want to delete this habit? This action cannot be undone and will remove all tracking data for this habit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-black hover:bg-black hover:text-white font-bold">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteHabit}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}