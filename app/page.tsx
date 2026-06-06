'use client';

import { HabitGrid } from '@/components/HabitGrid';
import { MonthSelector } from '@/components/MonthSelector';
import { PrintableHabitGrid } from '@/components/PrintableHabitGrid';
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
  const printableRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 overflow-auto font-mono">
      <div className="w-full max-w-6xl">
        <Card className="p-3 sm:p-6 border-2 border-black flex flex-col overflow-hidden bg-white shadow-lg rounded-[2rem]">
          <div className="flex flex-col gap-3 mb-4">
            <div className="border-2 border-black rounded-2xl p-3 flex items-center justify-center">
              <MonthSelector
                currentMonth={data.currentMonth}
                onMonthChange={handleMonthChange}
              />
            </div>

            <div className="flex flex-col gap-3">
              <ShareButton
                gridRef={gridRef}
                printableRef={printableRef}
                monthYear={data.currentMonth}
              />
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-2 border-black hover:bg-black hover:text-white font-bold text-sm cursor-pointer"
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

          <div className="flex-1 min-h-0 overflow-hidden w-full">
            <div ref={gridRef} className="flex-1 flex flex-col bg-white min-h-0 w-full">
              {/* <div className="text-center py-4 border-b-2 border-black">
                <h2 className="text-md font-bold uppercase tracking-wider">
                  {new Date(data.currentMonth).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>
              </div> */}
              <HabitGrid
                data={data}
                onToggleCompletion={handleToggleCompletion}
                onDeleteHabit={handleDeleteHabit}
              />
            </div>
          </div>
        </Card>
      </div>

      <div
        aria-hidden="true"
        className="fixed left-[-9999px] top-0 pointer-events-none"
      >
        <PrintableHabitGrid ref={printableRef} data={data} />
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