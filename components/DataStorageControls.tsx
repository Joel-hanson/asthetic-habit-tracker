'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { actionButtonCompactClass } from '@/lib/uiStyles';
import { clearStoredData, parseImportedData, serializeData } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { TrackerData } from '@/types/habit';
import { format } from 'date-fns';
import { Database, Download, HardDrive, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface DataStorageControlsProps {
  data: TrackerData;
  onImport: (data: TrackerData) => void;
  onClear: () => void;
  className?: string;
}

export function DataStorageControls({
  data,
  onImport,
  onClear,
  className,
}: DataStorageControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const blob = new Blob([serializeData(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const raw = await file.text();
      onImport(parseImportedData(raw));
      setIsOpen(false);
    } catch (error) {
      console.error('Error importing backup:', error);
      alert(error instanceof Error ? error.message : 'Failed to import backup. Please check the file.');
    }
  };

  const handleClear = () => {
    clearStoredData();
    onClear();
    setConfirmClearOpen(false);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button type="button" className={cn(actionButtonCompactClass, className)}>
            <HardDrive className="w-3.5 h-3.5 mr-1.5" />
            Local Data
          </button>
        </DialogTrigger>
        <DialogContent className="border-2 border-black font-mono max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase">Local Storage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="rounded-xl border-2 border-black/10 bg-gray-50 p-3">
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Stays on your device</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Habits and progress are saved in your browser&apos;s local storage. Nothing is sent to a server.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2">Backup & restore</p>
              <p className="text-xs text-gray-600 mb-3">
                Export a JSON file to move your data to another browser or device, or restore from a previous backup.
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={exportBackup}
                  className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold justify-start cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export backup
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full border-2 border-black hover:bg-black hover:text-white font-bold justify-start cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import backup
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="border-t-2 border-black pt-4">
              <p className="text-xs font-bold uppercase tracking-wide mb-2">Reset</p>
              <Button
                onClick={() => setConfirmClearOpen(true)}
                variant="outline"
                className="w-full border-2 border-black hover:bg-red-600 hover:text-white hover:border-red-600 font-bold justify-start cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear all local data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent className="border-2 border-black font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold uppercase">Clear all data?</AlertDialogTitle>
            <AlertDialogDescription className="text-black">
              This removes all habits, completions, and settings from this browser. Export a backup first if you want to keep your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-black hover:bg-black hover:text-white font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 font-bold"
            >
              Clear data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
