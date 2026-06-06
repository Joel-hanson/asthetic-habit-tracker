import { toBlob, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/** A4 at 96 DPI — shared canvas for image, PDF, and print. */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;
export const A4_PADDING_PX = 40;
export const A4_CONTENT_WIDTH_PX = A4_WIDTH_PX - A4_PADDING_PX * 2;
export const A4_EXPORT_PIXEL_RATIO = 2;
export const A4_PAGE_MARGIN_MM = 10;

const CAPTURE_OPTIONS = {
  quality: 1,
  pixelRatio: A4_EXPORT_PIXEL_RATIO,
  backgroundColor: '#ffffff',
  cacheBust: true,
  width: A4_WIDTH_PX,
  height: A4_HEIGHT_PX,
  style: {
    transform: 'none',
  },
} as const;

export interface PrintableCapture {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export async function capturePrintable(element: HTMLElement): Promise<PrintableCapture> {
  const [dataUrl, blob] = await Promise.all([
    toPng(element, CAPTURE_OPTIONS),
    toBlob(element, CAPTURE_OPTIONS),
  ]);

  if (!blob) {
    throw new Error('Failed to generate printable image.');
  }

  return {
    dataUrl,
    blob,
    width: A4_WIDTH_PX * A4_EXPORT_PIXEL_RATIO,
    height: A4_HEIGHT_PX * A4_EXPORT_PIXEL_RATIO,
  };
}

/** Fit image on A4 with consistent margins (used by PDF and print). */
export function getA4ImagePlacement(imgWidth: number, imgHeight: number) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = A4_PAGE_MARGIN_MM;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
  const width = imgWidth * scale;
  const height = imgHeight * scale;
  const x = margin + (maxWidth - width) / 2;
  const y = margin + (maxHeight - height) / 2;

  return { x, y, width, height, pageWidth, pageHeight, margin, maxWidth, maxHeight };
}

export function createPrintablePdf(dataUrl: string, imgWidth: number, imgHeight: number): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const placement = getA4ImagePlacement(imgWidth, imgHeight);
  pdf.addImage(dataUrl, 'PNG', placement.x, placement.y, placement.width, placement.height);
  return pdf;
}

export function buildPrintableHtml(dataUrl: string, monthYear: string): string {
  const placement = getA4ImagePlacement(A4_WIDTH_PX, A4_HEIGHT_PX);
  const imgWidthMm = placement.width.toFixed(2);
  const imgHeightMm = placement.height.toFixed(2);
  const imgTopMm = placement.y.toFixed(2);
  const imgLeftMm = placement.x.toFixed(2);

  return `<!DOCTYPE html>
<html>
  <head>
    <title>Habit Tracker - ${monthYear}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
        height: 297mm;
        background: #fff;
      }
      img {
        position: absolute;
        top: ${imgTopMm}mm;
        left: ${imgLeftMm}mm;
        width: ${imgWidthMm}mm;
        height: ${imgHeightMm}mm;
        display: block;
      }
    </style>
  </head>
  <body>
    <img src="${dataUrl}" alt="Habit tracker for ${monthYear}" />
    <script>
      window.onload = () => {
        window.print();
        window.onafterprint = () => window.close();
      };
    </script>
  </body>
</html>`;
}

export function computePrintChunkSize(totalDays: number): number {
  const labelWidth = 120;
  const gap = 8;
  const minCell = 14;

  for (let chunkSize = Math.min(31, totalDays); chunkSize >= 7; chunkSize--) {
    const cellSize =
      (A4_CONTENT_WIDTH_PX - labelWidth - gap - (chunkSize - 1) * gap) / chunkSize;
    if (cellSize >= minCell) {
      return chunkSize;
    }
  }

  return 7;
}

export function buildPrintChunks(days: number[], chunkSize: number): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < days.length; i += chunkSize) {
    chunks.push(days.slice(i, i + chunkSize));
  }
  return chunks;
}

export function getPrintCellSize(chunkSize: number): number {
  const labelWidth = 120;
  const gap = 8;
  return Math.floor(
    (A4_CONTENT_WIDTH_PX - labelWidth - gap - (chunkSize - 1) * gap) / chunkSize
  );
}
