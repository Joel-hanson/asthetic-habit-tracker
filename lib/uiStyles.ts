export const pillBase =
  'inline-flex items-center justify-center rounded-xl border-2 font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer';

export const pillIdle =
  'border-black/15 bg-white text-black hover:border-black hover:bg-black hover:text-white';

export const pillActive = 'border-black bg-black text-white';

export const actionButtonClass = `${pillBase} ${pillIdle} h-9 w-full shadow-none`;

export const actionButtonCompactClass = `${pillBase} ${pillIdle} h-9 px-3 sm:px-4 shadow-none shrink-0`;
