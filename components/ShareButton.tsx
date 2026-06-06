'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toBlob, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, Facebook, FileText, Link2, Linkedin, Printer, Share2, Twitter } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  printableRef: React.RefObject<HTMLDivElement | null>;
  monthYear: string;
}

export function ShareButton({ gridRef, printableRef, monthYear }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const captureElement = async (element: HTMLElement) => {
    return toBlob(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        transform: 'none',
      },
    });
  };

  const generateImage = async (ref: React.RefObject<HTMLDivElement | null>): Promise<Blob | null> => {
    if (!ref.current) return null;

    setIsGenerating(true);

    try {
      return await captureElement(ref.current);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadImage = async () => {
    const blob = await generateImage(gridRef);
    if (!blob) return;
    downloadBlob(blob, `habit-tracker-${monthYear}.png`);
  };

  const downloadPrintableImage = async () => {
    const blob = await generateImage(printableRef);
    if (!blob) return;
    downloadBlob(blob, `habit-tracker-printable-${monthYear}.png`);
  };

  const downloadPrintablePdf = async () => {
    if (!printableRef.current) return;

    setIsGenerating(true);

    try {
      const element = printableRef.current;
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          transform: 'none',
        },
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const orientation = img.width >= img.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [img.width, img.height],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`habit-tracker-printable-${monthYear}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const printPrintable = async () => {
    if (!printableRef.current) return;

    setIsGenerating(true);

    try {
      const dataUrl = await toPng(printableRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to print your habit tracker.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Habit Tracker - ${monthYear}</title>
            <style>
              @page { margin: 0.5in; }
              body { margin: 0; display: flex; justify-content: center; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Habit tracker for ${monthYear}" />
            <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to open print view. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
    const blob = await generateImage(printableRef);
    if (!blob) return;

    const file = new File([blob], `habit-tracker-printable-${monthYear}.png`, {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'My Habit Tracker',
          text: `My habit tracker for ${monthYear}`,
          files: [file],
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      await downloadPrintableImage();
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
          SHARE & EXPORT
        </Button>
      </DialogTrigger>
      <DialogContent className="border-2 border-black font-mono max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase">
            Share & Export
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2">Printable export</p>
            <p className="text-xs text-gray-600 mb-3">
              Clean layout with month title and habit grid only — ideal for printing or saving.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={downloadPrintablePdf}
                disabled={isGenerating}
                className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold justify-start cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? 'GENERATING...' : 'DOWNLOAD PDF'}
              </Button>

              <Button
                onClick={downloadPrintableImage}
                disabled={isGenerating}
                variant="outline"
                className="w-full border-2 border-black hover:bg-black hover:text-white font-bold justify-start cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'GENERATING...' : 'DOWNLOAD IMAGE'}
              </Button>

              <Button
                onClick={printPrintable}
                disabled={isGenerating}
                variant="outline"
                className="w-full border-2 border-black hover:bg-black hover:text-white font-bold justify-start cursor-pointer"
              >
                <Printer className="w-4 h-4 mr-2" />
                {isGenerating ? 'GENERATING...' : 'PRINT'}
              </Button>

              {typeof window !== 'undefined' && typeof navigator.share !== 'undefined' && (
                <Button
                  onClick={shareNative}
                  disabled={isGenerating}
                  variant="outline"
                  className="w-full border-2 border-black hover:bg-black hover:text-white font-bold justify-start cursor-pointer"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isGenerating ? 'GENERATING...' : 'SHARE IMAGE'}
                </Button>
              )}
            </div>
          </div>

          <div className="border-t-2 border-black pt-4">
            <p className="text-xs font-bold uppercase tracking-wide mb-2">Screen capture</p>
            <p className="text-xs text-gray-600 mb-3">
              Export exactly what you see on screen for {monthYear}.
            </p>
            <Button
              onClick={downloadImage}
              disabled={isGenerating}
              variant="outline"
              className="w-full border-2 border-black hover:bg-black hover:text-white font-bold justify-start cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'GENERATING...' : 'DOWNLOAD SCREENSHOT'}
            </Button>
          </div>

          <div className="border-t-2 border-black pt-4">
            <p className="text-xs font-bold uppercase tracking-wide mb-2">Share online</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={shareToTwitter}
                variant="outline"
                className="w-full border-2 border-black hover:bg-blue-500 hover:text-white hover:border-blue-500 font-bold justify-start cursor-pointer"
              >
                <Twitter className="w-4 h-4 mr-2" />
                SHARE ON TWITTER
              </Button>

              <Button
                onClick={shareToFacebook}
                variant="outline"
                className="w-full border-2 border-black hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold justify-start cursor-pointer"
              >
                <Facebook className="w-4 h-4 mr-2" />
                SHARE ON FACEBOOK
              </Button>

              <Button
                onClick={shareToLinkedIn}
                variant="outline"
                className="w-full border-2 border-black hover:bg-blue-700 hover:text-white hover:border-blue-700 font-bold justify-start cursor-pointer"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                SHARE ON LINKEDIN
              </Button>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
