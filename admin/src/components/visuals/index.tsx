/**
 * Local illustrations (no external images): option thumbnails and a live window drawing
 * that reacts to the selected panels, aluminium colour and wood.
 */
import { clsx } from 'clsx';
import { Ban, Grip, Layers, PackageCheck, PanelTop, Ruler, Square, SquareStack } from 'lucide-react';
import type { Visual } from '@/types/domain';

export function WindowDrawing({
  panels = 3,
  opening = 'fold',
  frame = '#383E42',
  wood,
  width,
  height,
  className,
}: {
  panels?: number;
  opening?: 'fold' | 'slide';
  frame?: string;
  wood?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const W = 300;
  const H = 210;
  const pad = 14;
  const inner = W - pad * 2;
  const pw = inner / panels;
  return (
    <svg viewBox={`0 0 ${W} ${H + (width ? 26 : 0)}`} className={clsx('h-full w-full', className)} role="img" aria-label={`Baie ${panels} vantaux`}>
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DBEAFE" />
          <stop offset="0.55" stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#BFDBFE" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="4" fill={frame} />
      {wood && <rect x="7" y="7" width={W - 14} height={H - 14} rx="2" fill={wood} opacity="0.9" />}
      {Array.from({ length: panels }).map((_, i) => {
        const x = pad + i * pw;
        return (
          <g key={i}>
            <rect x={x + 3} y={pad} width={pw - 6} height={H - pad * 2} rx="2" fill={frame} />
            <rect x={x + 9} y={pad + 6} width={pw - 18} height={H - pad * 2 - 12} fill="url(#glass)" />
            <line x1={x + 16} y1={pad + 18} x2={x + pw * 0.45} y2={pad + 40} stroke="white" strokeWidth="3" opacity=".7" />
            {opening === 'fold' ? (
              <path
                d={i % 2 === 0 ? `M${x + 12} ${H - pad - 12} L${x + pw - 12} ${H / 2} L${x + 12} ${pad + 12}` : `M${x + pw - 12} ${H - pad - 12} L${x + 12} ${H / 2} L${x + pw - 12} ${pad + 12}`}
                fill="none"
                stroke="#64748B"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
            ) : (
              <path d={`M${x + pw / 2 - 16} ${H / 2} h32 m-6 -6 l6 6 l-6 6`} fill="none" stroke="#2563EB" strokeWidth="2" />
            )}
            <rect x={i % 2 === 0 ? x + pw - 14 : x + 8} y={H / 2 - 10} width="4" height="20" rx="2" fill="#CBD5E1" />
          </g>
        );
      })}
      {width && (
        <text x={W / 2} y={H + 18} textAnchor="middle" fontSize="11" fontWeight="600" fill="#475569">
          {width} × {height} mm
        </text>
      )}
    </svg>
  );
}

const iconFor = { handle: Grip, shutter: PanelTop, kit: PackageCheck, frame: Square, none: Ban, profile: Layers, material: SquareStack };

/** Thumbnail for an option card. */
export function OptionVisual({ visual, className }: { visual: Visual; className?: string }) {
  const base = clsx('relative overflow-hidden rounded-lg', className);
  switch (visual.type) {
    case 'color':
      return <div className={base} style={{ background: `linear-gradient(135deg, ${visual.hex} 0%, ${visual.hex} 60%, color-mix(in srgb, ${visual.hex} 82%, white) 100%)` }} />;
    case 'wood':
      return (
        <div
          className={base}
          style={{
            backgroundColor: visual.tone,
            backgroundImage: `repeating-linear-gradient(100deg, rgba(0,0,0,.07) 0 2px, transparent 2px 9px), repeating-linear-gradient(97deg, rgba(255,255,255,.12) 0 1px, transparent 1px 15px)`,
          }}
        />
      );
    case 'window':
      return (
        <div className={clsx(base, 'grid place-items-center bg-canvas p-2')}>
          <WindowDrawing panels={visual.panels} opening={visual.opening} />
        </div>
      );
    case 'glazing':
      return (
        <div className={clsx(base, 'flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-50 to-sky-50')}>
          {Array.from({ length: visual.layers }).map((_, i) => (
            <div key={i} className="h-[70%] w-2.5 rounded-sm border border-emerald-300 bg-emerald-200/60" style={{ transform: 'skewY(-12deg)' }} />
          ))}
        </div>
      );
    case 'icon': {
      const Icon = iconFor[visual.name] ?? Ruler;
      return (
        <div className={clsx(base, 'grid place-items-center bg-slate-50 text-slate-500')}>
          <Icon size={30} strokeWidth={1.5} />
        </div>
      );
    }
  }
}
