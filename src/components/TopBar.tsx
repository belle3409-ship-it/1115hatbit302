import { Award, BookOpen } from 'lucide-react';
import type { MuseumZoneId } from '../data/museumExhibits';

interface TopBarProps {
  activeZone: MuseumZoneId;
  stampsCount: number;
  userNickname: string;
  onSelectZone: (zone: MuseumZoneId, teleport?: boolean) => void;
  onOpenPassport: () => void;
}

const NAV_ITEMS: { id: MuseumZoneId; label: string }[] = [
  { id: 'atrium', label: '대청마루' },
  { id: 'meme_meaning', label: '1방 요즘 밈' },
  { id: 'proper_korean', label: '2방 바른말' },
  { id: 'empathy_mirror', label: '3방 마음거울' },
];

export function TopBar({
  activeZone,
  stampsCount,
  userNickname,
  onSelectZone,
  onOpenPassport,
}: TopBarProps) {
  return (
    <header className="relative z-20 flex h-14 w-full items-center justify-between gap-8 border-b border-stone-200 bg-[#FBF6EC] px-5 text-slate-900">
      {/* Zone 1: Single-element brand wordmark */}
      <button
        type="button"
        onClick={() => onSelectZone('atrium', true)}
        className="font-display flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 rounded-md px-1"
      >
        <BookOpen className="h-5 w-5 text-amber-700 shrink-0" aria-hidden="true" />
        <span>반짝반짝 바른 우리말 서당</span>
      </button>

      {/* Zone 2: 4 single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        {NAV_ITEMS.map((item) => {
          const isCurrent = activeZone === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectZone(item.id, true)}
              className={`relative py-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-amber-500 ${
                isCurrent ? 'font-semibold text-slate-950 underline decoration-amber-600 decoration-2 underline-offset-4' : ''
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action (no login required) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenPassport}
          className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-800 whitespace-nowrap shrink-0 cursor-pointer tabular-nums focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <Award className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{userNickname} · 도장 {stampsCount}</span>
        </button>
      </div>
    </header>
  );
}
