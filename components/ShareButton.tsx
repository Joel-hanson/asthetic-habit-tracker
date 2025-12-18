'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toBlob } from 'html-to-image';
import { Download, Facebook, Link2, Linkedin, Share2, Twitter } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  monthYear: string;
}

export function ShareButton({ gridRef, monthYear }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!gridRef.current) return null;

    setIsGenerating(true);

    try {
      // Use html-to-image which handles modern CSS much better
      const blob = await toBlob(gridRef.current, {
        quality: 1,
        pixelRatio: 2, // Higher quality (2x)
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          // Ensure the element is fully visible
          transform: 'none',
        },
      });

      return blob;
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-${monthYear}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareToTwitter = async () => {
    const text = `Check out my habit tracker for ${monthYear}! 🎯 #HabitTracker #Productivity`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = async () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = async () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const shareNative = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], `habit-tracker-${monthYear}.png`, {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'My Habit Tracker',
          text: `Check out my habit tracker for ${monthYear}!`,
          files: [file],
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to download if native share is not supported
      await downloadImage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-black hover:bg-black hover:text-white font-bold text-xs sm:text-sm w-full sm:w-auto cursor-pointer"
        >
          <Share2 className="w-4 h-4 mr-2" />
          SHARE
        </Button>
      </DialogTrigger>
      <DialogContent className="border-2 border-black font-mono">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase">
            Share Your Progress
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Share your habit tracking progress for {monthYear}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {/* Native Share (Mobile) */}
            {typeof window !== 'undefined' && typeof navigator.share !== 'undefined' && (
              <Button
                onClick={shareNative}
                disabled={isGenerating}
                className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold justify-start cursor-pointer"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isGenerating ? 'GENERATING...' : 'SHARE IMAGE'}
              </Button>
            )}

            {/* Download Image */}
            <Button
              onClick={downloadImage}
              disabled={isGenerating}
              variant="outline"
              className="w-full border-2 border-black hover:bg-black hover:text-white font-bold justify-start cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'GENERATING...' : 'DOWNLOAD IMAGE'}
            </Button>

            {/* Twitter */}
            <Button
              onClick={shareToTwitter}
              variant="outline"
              className="w-full border-2 border-black hover:bg-blue-500 hover:text-white hover:border-blue-500 font-bold justify-start cursor-pointer"
            >
              <Twitter className="w-4 h-4 mr-2" />
              SHARE ON TWITTER
            </Button>

            {/* Facebook */}
            <Button
              onClick={shareToFacebook}
              variant="outline"
              className="w-full border-2 border-black hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold justify-start cursor-pointer"
            >
              <Facebook className="w-4 h-4 mr-2" />
              SHARE ON FACEBOOK
            </Button>

            {/* LinkedIn */}
            <Button
              onClick={shareToLinkedIn}
              variant="outline"
              className="w-full border-2 border-black hover:bg-blue-700 hover:text-white hover:border-blue-700 font-bold justify-start cursor-pointer"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              SHARE ON LINKEDIN
            </Button>

            {/* Copy Link */}
            <Button
              onClick={copyLink}
              variant="outline"
              className="w-full border-2 border-black hover:bg-black hover:text-white font-bold justify-start cursor-pointer"
            >
              <Link2 className="w-4 h-4 mr-2" />
              COPY LINK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

