import { AnimatePresence, motion } from 'motion/react';

export interface StampCelebrationEvent {
  seq: number;
  kind: 'visit' | 'quiz';
  title: string;
  subtitle: string;
  isNewStamp: boolean;
  totalStamps: number;
}

interface StampCelebrationProps {
  event: StampCelebrationEvent | null;
}

const PETAL_DIRECTIONS = [
  { x: -54, y: -36, rot: -25, color: '#D97706' },
  { x: 52, y: -38, rot: 22, color: '#E11D48' },
  { x: -64, y: 12, rot: -45, color: '#059669' },
  { x: 64, y: 10, rot: 40, color: '#0284C7' },
  { x: -34, y: 48, rot: -15, color: '#E11D48' },
  { x: 36, y: 46, rot: 20, color: '#D97706' },
];

export function StampCelebration({ event }: StampCelebrationProps) {
  const isQuiz = event?.kind === 'quiz';
  const sealColor = isQuiz ? '#DC2626' : '#B45309';
  const ringAccent = isQuiz ? '#059669' : '#0284C7';
  const sealTopText = isQuiz ? '바른말' : '첫발걸음';
  const sealMainText = isQuiz ? '참잘함' : '탐험완료';

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-20 left-1/2 z-50 -translate-x-1/2 px-4"
    >
      <AnimatePresence mode="wait">
        {event && (
          <motion.div
            key={event.seq}
            initial={{ opacity: 0, y: -18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center gap-4 rounded-2xl border-2 border-amber-300 bg-[#FFFDF8] px-5 py-3.5 shadow-xl"
          >
            {/* Traditional Korean Lattice Corner Ornament (Top-Left) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1.5 left-1.5 h-4 w-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M2 14V2h12M2 7h7V2" />
            </svg>

            {/* Traditional Korean Lattice Corner Ornament (Bottom-Right) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-1.5 bottom-1.5 h-4 w-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M22 10v12H10M22 17h-7v5" />
            </svg>

            {/* Traditional Korean Pattern Stamp Visual */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
              {/* Ink impact halo ring */}
              <motion.div
                initial={{ scale: 0.65, opacity: 0.85 }}
                animate={{ scale: 1.42, opacity: 0 }}
                transition={{ delay: 0.14, duration: 0.55, ease: 'easeOut' }}
                className="absolute inset-1 rounded-full border-2"
                style={{ borderColor: sealColor }}
              />

              {/* Traditional 4-petal Korean plum blossom burst */}
              {PETAL_DIRECTIONS.map((p, idx) => (
                <motion.svg
                  key={idx}
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="absolute h-3.5 w-3.5"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                  animate={{ x: p.x, y: p.y, scale: 1, opacity: [0, 1, 0], rotate: p.rot }}
                  transition={{ delay: 0.15, duration: 0.72, ease: 'easeOut' }}
                >
                  <path
                    d="M8 1C9.6 4 12 6.4 15 8C12 9.6 9.6 12 8 15C6.4 12 4 9.6 1 8C4 6.4 6.4 4 8 1Z"
                    fill={p.color}
                  />
                </motion.svg>
              ))}

              {/* Stamped Traditional Seal SVG */}
              <motion.div
                initial={{ scale: 2.3, opacity: 0, rotate: -22 }}
                animate={{ scale: 1, opacity: 1, rotate: -7 }}
                transition={{
                  delay: 0.06,
                  type: 'spring',
                  stiffness: 430,
                  damping: 20,
                  mass: 0.85,
                }}
                className="relative h-20 w-20"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
                  {/* Outer 12-petal traditional lotus/dancheong ring */}
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const angle = idx * 30;
                    return (
                      <ellipse
                        key={idx}
                        cx="50"
                        cy="11"
                        rx="6.2"
                        ry="4.2"
                        fill={idx % 2 === 0 ? sealColor : ringAccent}
                        fillOpacity="0.9"
                        transform={`rotate(${angle} 50 50)`}
                      />
                    );
                  })}

                  {/* Stamp body circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="#FFF7ED"
                    stroke={sealColor}
                    strokeWidth="3.2"
                  />

                  {/* Traditional Korean lattice inner border */}
                  <circle
                    cx="50"
                    cy="50"
                    r="30.5"
                    fill="none"
                    stroke={sealColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 2.5"
                  />

                  {/* Top curved ornament dot & lines */}
                  <path
                    d="M33 35 Q50 26 67 35"
                    fill="none"
                    stroke={ringAccent}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M33 66 Q50 75 67 66"
                    fill="none"
                    stroke={ringAccent}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Traditional seal typography */}
                  <text
                    x="50"
                    y="44"
                    textAnchor="middle"
                    fill={ringAccent}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="var(--font-display)"
                  >
                    {sealTopText}
                  </text>
                  <text
                    x="50"
                    y="61"
                    textAnchor="middle"
                    fill={sealColor}
                    fontSize="15"
                    fontWeight="700"
                    fontFamily="var(--font-display)"
                  >
                    {sealMainText}
                  </text>
                </svg>
              </motion.div>
            </div>

            {/* Clean Typographic Celebration Copy */}
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold text-amber-700">
                <span>{isQuiz ? '바른 우리말 퀴즈 정답' : '새로운 글방 방문'}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {event.isNewStamp ? `새 도장 +1 (총 ${event.totalStamps}개)` : `총 도장 ${event.totalStamps}개`}
                </span>
              </div>
              <div className="font-display mt-0.5 text-lg font-bold text-slate-900 text-balance">
                {event.title}
              </div>
              <p className="mt-0.5 text-xs text-slate-600">{event.subtitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
