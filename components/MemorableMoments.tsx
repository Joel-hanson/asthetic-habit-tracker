'use client';

import { MemorableMoment } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface MemorableMomentsProps {
  moments: MemorableMoment[];
  onAddMoment: (content: string, date: string) => void;
  onDeleteMoment: (momentId: string) => void;
}

export function MemorableMoments({ moments, onAddMoment, onDeleteMoment }: MemorableMomentsProps) {
  const [newMoment, setNewMoment] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMoment = () => {
    if (newMoment.trim()) {
      const today = format(new Date(), 'yyyy-MM-dd');
      onAddMoment(newMoment.trim(), today);
      setNewMoment('');
      setIsAdding(false);
    }
  };

  const sortedMoments = [...moments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Moments</h3>
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
          <Textarea
            placeholder="What made today special?"
            value={newMoment}
            onChange={(e) => setNewMoment(e.target.value)}
            rows={3}
            autoFocus
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddMoment} size="sm" className="flex-1 h-8">
              Save Moment
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewMoment('');
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

      <div className="space-y-2.5">
        {sortedMoments.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No moments yet
          </div>
        ) : (
          sortedMoments.map((moment) => (
            <div
              key={moment.id}
              className="p-3 rounded-lg border bg-card group hover:bg-accent transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    {format(new Date(moment.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {moment.content}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteMoment(moment.id)}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
