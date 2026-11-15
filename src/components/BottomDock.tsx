import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  MessageCircleQuestion,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AVATAR_COLORS, MUSEUM_ZONES, type AvatarColorId, type MuseumZoneId } from '../data/museumExhibits';

export interface DpadState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface BottomDockProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeZone: MuseumZoneId;
  cameraMode: 'third' | 'first';
  onToggleCameraMode: () => void;
  avatarColor: AvatarColorId;
  onChangeAvatarColor: (color: AvatarColorId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTeleportZone: (zone: MuseumZoneId) => void;
  onOpenLounge: () => void;
  onDpadChange: (key: keyof DpadState, pressed: boolean) => void;
}

export function BottomDock({
  collapsed,
  onToggleCollapse,
  activeZone,
  cameraMode,
  onToggleCameraMode,
  avatarColor,
  onChangeAvatarColor,
  soundEnabled,
  onToggleSound,
  onTeleportZone,
  onOpenLounge,
  onDpadChange,
}: BottomDockProps) {
  const bindHold = (key: keyof DpadState) => ({
    onPointerDown: () => onDpadChange(key, true),
    onPointerUp: () => onDpadChange(key, false),
    onPointerLeave: () => onDpadChange(key, false),
    onPointerCancel: () => onDpadChange(key, false),
  });

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-20 flex w-[min(940px,95vw)] -translate-x-1/2 flex-col items-center transition-transform duration-200"
      style={{ transform: collapsed ? 'translate(-50%, calc(100% - 34px))' : 'translate(-50%, 0)' }}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="pointer-events-auto flex items-center gap-1.5 rounded-t-lg border border-b-0 border-stone-300 bg-[#FFFDF9] px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-stone-100 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        {collapsed ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>컨트롤 열기</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span>컨트롤 접기</span>
          </>
        )}
      </button>

      <div className="pointer-events-auto flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-300 bg-[#FFFDF9] px-4 py-2.5 shadow-lg">
        {/* Movement D-pad */}
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              type="button"
              aria-label="앞으로 걷기"
              {...bindHold('forward')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-slate-800 active:bg-amber-200 hover:bg-stone-200 cursor-pointer"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <div />
            <button
              type="button"
              aria-label="왼쪽으로 걷기"
              {...bindHold('left')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-slate-800 active:bg-amber-200 hover:bg-stone-200 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="뒤로 걷기"
              {...bindHold('backward')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-slate-800 active:bg-amber-200 hover:bg-stone-200 cursor-pointer"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="오른쪽으로 걷기"
              {...bindHold('right')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-slate-800 active:bg-amber-200 hover:bg-stone-200 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <span className="hidden lg:inline text-xs text-slate-500 whitespace-nowrap">
            방향키 · 마루 클릭 이동
          </span>
        </div>

        {/* Quick Seodang Room Teleports */}
        <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 overflow-x-auto max-w-full">
          {MUSEUM_ZONES.filter((z) => z.id !== 'lounge').map((zone) => {
            const active = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => onTeleportZone(zone.id)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="h-3.5 w-3.5" style={{ color: zone.accentHex }} aria-hidden="true" />
                <span>{zone.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Hanbok Baeja Color, Camera Mode, Audio & Young Teacher Q&A Room */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5" title="학동 한복 배자 색깔">
            {(Object.keys(AVATAR_COLORS) as AvatarColorId[]).map((cid) => {
              const info = AVATAR_COLORS[cid];
              const selected = avatarColor === cid;
              return (
                <button
                  key={cid}
                  type="button"
                  aria-label={`${info.label} 선택`}
                  onClick={() => onChangeAvatarColor(cid)}
                  className={`h-5 w-5 rounded-full border-2 transition-transform cursor-pointer ${
                    selected ? 'scale-110 border-slate-900' : 'border-white hover:scale-105'
                  }`}
                  style={{ backgroundColor: info.hex }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={onToggleCameraMode}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
            <span>{cameraMode === 'third' ? '3인칭 학동' : '1인칭 VR'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-slate-700 hover:bg-stone-100 cursor-pointer shrink-0"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onOpenLounge}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <MessageCircleQuestion className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>따봄쌤방</span>
          </button>
        </div>
      </div>
    </div>
  );
}
