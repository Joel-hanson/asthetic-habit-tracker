'use client';

import { ChallengeSettings } from '@/components/ChallengeSettings';
import { HabitGrid } from '@/components/HabitGrid';
import { PrintableHabitGrid } from '@/components/PrintableHabitGrid';
import { ShareButton } from '@/components/ShareButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getChallengeExportSlug } from '@/lib/challenge';
import { actionButtonClass } from '@/lib/uiStyles';
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

  const handleStartDateChange = (startDate: string) => {
    setData({
      ...data,
      challengeStartDate: startDate,
      currentMonth: startDate.slice(0, 7),
    });
  };

  const handleDurationChange = (days: number) => {
    setData({ ...data, challengeDays: days });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 overflow-auto font-mono">
      <div className="w-full max-w-6xl">
        <Card className="p-3 sm:p-5 border-2 border-black flex flex-col overflow-hidden bg-white shadow-lg rounded-[2rem]">
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 flex-1 min-h-0">
            <aside className="md:w-44 lg:w-48 shrink-0 md:border-r md:border-black/10 md:pr-4 flex flex-col gap-4">
              <ChallengeSettings
                challengeStartDate={data.challengeStartDate}
                challengeDays={data.challengeDays}
                onStartDateChange={handleStartDateChange}
                onDurationChange={handleDurationChange}
              />

              <div className="flex flex-col gap-1.5 pt-1 border-t border-black/10">
                <ShareButton
                  gridRef={gridRef}
                  printableRef={printableRef}
                  exportSlug={getChallengeExportSlug(data)}
                  className="w-full"
                />
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className={actionButtonClass}>
                      + Add Habit
                    </button>
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
            </aside>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div ref={gridRef} className="flex flex-col bg-white min-h-0 w-full">
                <HabitGrid
                  data={data}
                  onToggleCompletion={handleToggleCompletion}
                  onDeleteHabit={handleDeleteHabit}
                />
              </div>
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