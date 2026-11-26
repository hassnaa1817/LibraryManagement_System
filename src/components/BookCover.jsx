import React from 'react';

function CoverMotif({ motif, accent }) {
  switch (motif) {
    case 'nodes':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <circle cx="32" cy="36" r="10" stroke={accent} strokeWidth="2" />
          <circle cx="88" cy="32" r="7" stroke={accent} strokeWidth="2" />
          <circle cx="62" cy="72" r="14" stroke={accent} strokeWidth="2" />
          <circle cx="28" cy="92" r="6" stroke={accent} strokeWidth="2" />
          <line x1="41" y1="36" x2="81" y2="33" stroke={accent} strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="38" y1="44" x2="53" y2="61" stroke={accent} strokeWidth="1.5" />
          <line x1="83" y1="38" x2="70" y2="60" stroke={accent} strokeWidth="1.5" />
          <line x1="50" y1="80" x2="33" y2="89" stroke={accent} strokeWidth="1.5" />
        </svg>
      );
    case 'lambda':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <circle cx="60" cy="60" r="42" stroke={accent} strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M40 88 L58 34 L79 88" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M51 64 L66 64" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'orbit':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <circle cx="60" cy="60" r="10" fill={accent} fillOpacity="0.35" stroke={accent} strokeWidth="1.8" />
          <ellipse cx="60" cy="60" rx="46" ry="18" transform="rotate(-24 60 60)" stroke={accent} strokeWidth="1.5" />
          <ellipse cx="60" cy="60" rx="46" ry="18" transform="rotate(32 60 60)" stroke={accent} strokeWidth="1.5" />
        </svg>
      );
    case 'wave':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <path d="M10 42 Q35 20 60 42 T110 42" stroke={accent} strokeWidth="2" />
          <path d="M10 60 Q35 38 60 60 T110 60" stroke={accent} strokeWidth="2" />
          <path d="M10 78 Q35 56 60 78 T110 78" stroke={accent} strokeWidth="2" />
        </svg>
      );
    case 'rings':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <circle cx="60" cy="60" r="42" stroke={accent} strokeWidth="1.5" />
          <circle cx="60" cy="60" r="29" stroke={accent} strokeWidth="1.5" />
          <circle cx="60" cy="60" r="16" stroke={accent} strokeWidth="1.5" />
          <circle cx="60" cy="60" r="4" fill={accent} />
        </svg>
      );
    case 'spiral':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <polygon points="60,16 102,88 18,88" stroke={accent} strokeWidth="1.8" />
          <polygon points="60,34 86,80 34,80" stroke={accent} strokeWidth="1.5" />
          <circle cx="60" cy="64" r="10" stroke={accent} strokeWidth="1.5" />
        </svg>
      );
    case 'arch':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <path d="M26 96 V52 A34 34 0 0 1 94 52 V96" stroke={accent} strokeWidth="2" />
          <path d="M40 96 V56 A20 20 0 0 1 80 56 V96" stroke={accent} strokeWidth="1.5" />
          <line x1="18" y1="96" x2="102" y2="96" stroke={accent} strokeWidth="1.5" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-35" fill="none">
          <circle cx="60" cy="60" r="38" stroke={accent} strokeWidth="1.5" />
          <polygon points="60,26 68,54 94,60 68,66 60,94 52,66 26,60 52,54" stroke={accent} strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-30" fill="none">
          <rect x="22" y="22" width="34" height="34" rx="4" stroke={accent} strokeWidth="1.6" />
          <rect x="64" y="22" width="34" height="34" rx="4" stroke={accent} strokeWidth="1.6" />
          <rect x="22" y="64" width="34" height="34" rx="4" stroke={accent} strokeWidth="1.6" />
          <rect x="64" y="64" width="34" height="34" rx="4" stroke={accent} strokeWidth="1.6" />
        </svg>
      );
  }
}

export default function BookCover({ book, size = 'md', className = '' }) {
  const palette = book?.coverPalette || { from: '#172A3A', to: '#214C52', accent: '#69B7B0' };

  const sizeStyles = {
    xs: 'w-11 h-15 rounded-md p-1.5',
    sm: 'w-16 h-22 rounded-lg p-2',
    md: 'w-full aspect-[3/4] rounded-xl p-4',
    lg: 'w-56 sm:w-64 aspect-[3/4] rounded-2xl p-6',
  };

  const isCompact = size === 'xs' || size === 'sm';

  if (book?.coverImage) {
    return (
      <div
        className={`relative overflow-hidden select-none shrink-0 shadow-md ${sizeStyles[size] || sizeStyles.md} !p-0 ${className}`}
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-y-0 left-0 w-[8%] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(255,255,255,0.09) 65%, transparent 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden select-none shrink-0 flex flex-col justify-between text-white shadow-md ${sizeStyles[size] || sizeStyles.md} ${className}`}
      style={{
        background: `linear-gradient(150deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      {/* Subtle spine groove */}
      <div
        className="absolute inset-y-0 left-0 w-[8%] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(255,255,255,0.09) 65%, transparent 100%)',
        }}
      />

      {/* Decorative motif */}
      <div
        className={`absolute pointer-events-none ${
          isCompact ? 'right-[-12%] bottom-[-10%] w-10 h-10' : 'right-2 bottom-3 w-24 h-24'
        }`}
      >
        <CoverMotif motif={book?.coverMotif} accent={palette.accent} />
      </div>

      {/* Top Accent Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 pl-1">
        <span
          className="inline-block rounded-full"
          style={{
            width: isCompact ? 12 : 24,
            height: isCompact ? 2 : 3,
            backgroundColor: palette.accent,
          }}
        />
        {!isCompact && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 truncate">
            {book?.year}
          </span>
        )}
      </div>

      {/* Title & Author */}
      {!isCompact ? (
        <div className="relative z-10 pl-1 mt-auto">
          <p className="text-[10px] uppercase tracking-widest text-white/65 mb-1 truncate">
            {book?.category}
          </p>
          <h4
            className={`font-serif font-semibold leading-snug text-white line-clamp-3 ${
              size === 'lg' ? 'text-xl' : 'text-base'
            }`}
          >
            {book?.title}
          </h4>
          <p className="mt-2 text-xs text-white/80 truncate font-medium">
            {book?.author}
          </p>
        </div>
      ) : (
        <div className="relative z-10 pl-1 mt-auto">
          <div className="text-[8px] font-serif leading-tight text-white/95 line-clamp-2 font-medium">
            {book?.title}
          </div>
        </div>
      )}
    </div>
  );
}
