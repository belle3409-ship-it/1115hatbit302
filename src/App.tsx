import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Sparkles, Volume2 } from 'lucide-react';
import { BottomDock, type DpadState } from './components/BottomDock';
import { MuseumCanvas } from './components/MuseumCanvas';
import { StampCelebration, type StampCelebrationEvent } from './components/StampCelebration';
import { TopBar } from './components/TopBar';
import { ZonePanel } from './components/ZonePanel';
import {
  MEME_EXHIBITS,
  MUSEUM_ZONES,
  type AvatarColorId,
  type MuseumZoneId,
} from './data/museumExhibits';
import {
  auth,
  deleteQaEntry,
  ensureUserProfile,
  publishSharedPhrase,
  saveQaEntry,
  signInWithGoogle,
  signOutUser,
  subscribeQaEntries,
  subscribeSharedPhrases,
  updateUserProgress,
  type QaEntryDoc,
  type SharedPhraseDoc,
} from './services/firebase';
import { playMuseumChime, speakKorean } from './utils/audio';

const STORAGE_KEYS = {
  nickname: 'seodang_nickname_v1',
  avatarColor: 'seodang_avatar_color_v1',
  visitedZones: 'seodang_visited_zones_v1',
  completedQuizzes: 'seodang_completed_quizzes_v1',
  stampsCount: 'seodang_stamps_v1',
  qaEntries: 'seodang_qa_entries_v1',
  sharedPhrases: 'seodang_shared_phrases_v1',
};

const DEFAULT_SHARED_PHRASES: SharedPhraseDoc[] = [
  {
    id: 'seed_1',
    authorId: 'seodang_friend',
    authorNickname: '다솜 학동',
    visibility: 'public',
    memeWord: 'L을 가져가',
    properSentence: '아쉽지만 이번엔 내가 이겼네! 다음 판에는 우리 같이 더 멋지게 해 보자.',
    empathyNote: '진 친구의 마음이 상하지 않도록 다정하게 응원해요.',
  },
  {
    id: 'seed_2',
    authorId: 'seodang_friend_2',
    authorNickname: '하늘 학동',
    visibility: 'public',
    memeWord: '점메추',
    properSentence: '할머니, 오늘 점심에 어떤 맛있는 반찬을 먹으면 좋을까요?',
    empathyNote: '할머니께서 바로 알아들으실 수 있게 풀어서 여쭤봐요.',
  },
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Zero-login local-first state (synced to Firebase when user optionally signs in)
  const [userNickname, setUserNickname] = useState<string>(() =>
    localStorage.getItem(STORAGE_KEYS.nickname) || '3학년 학동',
  );
  const [avatarColor, setAvatarColor] = useState<AvatarColorId>(
    () => (localStorage.getItem(STORAGE_KEYS.avatarColor) as AvatarColorId) || 'sky',
  );
  const [localVisitedZones, setLocalVisitedZones] = useState<string[]>(() =>
    loadJson(STORAGE_KEYS.visitedZones, ['atrium']),
  );
  const [localCompletedQuizzes, setLocalCompletedQuizzes] = useState<string[]>(() =>
    loadJson(STORAGE_KEYS.completedQuizzes, []),
  );
  const [localStampsCount, setLocalStampsCount] = useState<number>(() =>
    Number(localStorage.getItem(STORAGE_KEYS.stampsCount) || 1),
  );
  const [localQaEntries, setLocalQaEntries] = useState<QaEntryDoc[]>(() =>
    loadJson(STORAGE_KEYS.qaEntries, []),
  );
  const [localSharedPhrases, setLocalSharedPhrases] = useState<SharedPhraseDoc[]>(() =>
    loadJson(STORAGE_KEYS.sharedPhrases, DEFAULT_SHARED_PHRASES),
  );

  const [cloudQaEntries, setCloudQaEntries] = useState<QaEntryDoc[]>([]);
  const [cloudSharedPhrases, setCloudSharedPhrases] = useState<SharedPhraseDoc[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // 3D Seodang & UI State
  const [activeZone, setActiveZone] = useState<MuseumZoneId>('atrium');
  const [selectedExhibitId, setSelectedExhibitId] = useState<string>(MEME_EXHIBITS[0].id);
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'third' | 'first'>('third');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [teleportTarget, setTeleportTarget] = useState<{ zone: MuseumZoneId; seq: number } | null>(null);
  const [nearbyPrompt, setNearbyPrompt] = useState<{
    zone: MuseumZoneId;
    title: string;
    exhibitId?: string;
  } | null>(null);

  const [stampEvent, setStampEvent] = useState<StampCelebrationEvent | null>(null);
  const stampTimerRef = useRef<number | null>(null);
  const visitedZonesRef = useRef<string[]>(localVisitedZones);
  const stampsCountRef = useRef<number>(localStampsCount);

  useEffect(() => {
    visitedZonesRef.current = localVisitedZones;
  }, [localVisitedZones]);

  useEffect(() => {
    stampsCountRef.current = localStampsCount;
  }, [localStampsCount]);

  useEffect(() => {
    return () => {
      if (stampTimerRef.current !== null) {
        window.clearTimeout(stampTimerRef.current);
      }
    };
  }, []);

  const triggerStampAnimation = useCallback(
    (payload: Omit<StampCelebrationEvent, 'seq'>) => {
      if (stampTimerRef.current !== null) {
        window.clearTimeout(stampTimerRef.current);
      }
      setStampEvent({ ...payload, seq: Date.now() + Math.random() });
      if (soundEnabled && payload.kind === 'visit') {
        playMuseumChime('stamp');
      }
      stampTimerRef.current = window.setTimeout(() => {
        setStampEvent(null);
      }, 2700);
    },
    [soundEnabled],
  );

  const dpadRef = useRef<DpadState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Persist local progress automatically
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.nickname, userNickname);
    localStorage.setItem(STORAGE_KEYS.avatarColor, avatarColor);
    localStorage.setItem(STORAGE_KEYS.visitedZones, JSON.stringify(localVisitedZones));
    localStorage.setItem(STORAGE_KEYS.completedQuizzes, JSON.stringify(localCompletedQuizzes));
    localStorage.setItem(STORAGE_KEYS.stampsCount, String(localStampsCount));
    localStorage.setItem(STORAGE_KEYS.qaEntries, JSON.stringify(localQaEntries));
    localStorage.setItem(STORAGE_KEYS.sharedPhrases, JSON.stringify(localSharedPhrases));
  }, [
    userNickname,
    avatarColor,
    localVisitedZones,
    localCompletedQuizzes,
    localStampsCount,
    localQaEntries,
    localSharedPhrases,
  ]);

  // Optional Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        try {
          const profile = await ensureUserProfile(user);
          if (profile.nickname) setUserNickname(profile.nickname);
          if (profile.avatarColor) setAvatarColor(profile.avatarColor);
          if (profile.visitedZones?.length) {
            setLocalVisitedZones((prev) => Array.from(new Set([...prev, ...profile.visitedZones])).slice(0, 10));
          }
          if (profile.completedQuizzes?.length) {
            setLocalCompletedQuizzes((prev) => Array.from(new Set([...prev, ...profile.completedQuizzes])).slice(0, 30));
          }
          if (typeof profile.stampsCount === 'number') {
            setLocalStampsCount((prev) => Math.max(prev, profile.stampsCount));
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      } else {
        setCloudQaEntries([]);
        setCloudSharedPhrases([]);
      }
    });
    return () => unsub();
  }, []);

  // Firestore real-time subscriptions when optionally signed in
  useEffect(() => {
    if (!authReady || !authUser) return;

    const unsubQa = subscribeQaEntries(
      authUser.uid,
      (entries) => setCloudQaEntries(entries),
      (err) => console.error('QA subscription error:', err),
    );
    const unsubShared = subscribeSharedPhrases(
      (phrases) => setCloudSharedPhrases(phrases),
      (err) => console.error('Shared phrases error:', err),
    );

    return () => {
      unsubQa();
      unsubShared();
    };
  }, [authReady, authUser]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        setPanelOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const recordZoneVisit = useCallback(
    (zone: MuseumZoneId) => {
      if (visitedZonesRef.current.includes(zone)) return;
      const nextVisited = [...visitedZonesRef.current, zone].slice(0, 10);
      const nextStamps = stampsCountRef.current + 1;
      visitedZonesRef.current = nextVisited;
      stampsCountRef.current = nextStamps;
      setLocalVisitedZones(nextVisited);
      setLocalStampsCount(nextStamps);

      if (zone !== 'atrium') {
        const meta = MUSEUM_ZONES.find((z) => z.id === zone);
        triggerStampAnimation({
          kind: 'visit',
          title: `${meta?.shortName || '새 글방'} 도장을 받았어요!`,
          subtitle: meta?.title || '서당의 새로운 학습 구역을 방문했어요.',
          isNewStamp: true,
          totalStamps: nextStamps,
        });
      }

      if (authUser) {
        updateUserProgress(authUser.uid, {
          visitedZones: nextVisited,
          stampsCount: nextStamps,
        }).catch(console.error);
      }
    },
    [authUser, triggerStampAnimation],
  );

  const handleSelectZone = useCallback(
    (zone: MuseumZoneId, shouldTeleport = false) => {
      setActiveZone(zone);
      recordZoneVisit(zone);
      if (shouldTeleport) {
        setTeleportTarget((prev) => ({ zone, seq: (prev?.seq || 0) + 1 }));
      } else {
        setPanelOpen(true);
      }
    },
    [recordZoneVisit],
  );

  const handleInteractExhibit = useCallback(
    (zone: MuseumZoneId, exhibitId?: string) => {
      setActiveZone(zone);
      if (exhibitId) setSelectedExhibitId(exhibitId);
      setPanelOpen(true);
      recordZoneVisit(zone);
    },
    [recordZoneVisit],
  );

  const handleNearZoneChange = useCallback(
    (nearby: { zone: MuseumZoneId; title: string; exhibitId?: string } | null) => {
      setNearbyPrompt(nearby);
      if (nearby) {
        setActiveZone(nearby.zone);
        if (nearby.zone !== 'atrium') {
          recordZoneVisit(nearby.zone);
        }
      }
    },
    [recordZoneVisit],
  );

  async function handleSignIn() {
    setAuthError(null);
    try {
      await signInWithGoogle();
      if (soundEnabled) playMuseumChime('success');
    } catch (err) {
      console.error('Sign in failed:', err);
      setAuthError('구글 연동 창이 닫혔거나 연결에 실패했어요.');
    }
  }

  async function handleSignOut() {
    await signOutUser();
  }

  async function handleChangeAvatarColor(color: AvatarColorId) {
    setAvatarColor(color);
    if (authUser) {
      await updateUserProgress(authUser.uid, { avatarColor: color }).catch(console.error);
    }
  }

  async function handleCompleteQuiz(quizId: string) {
    const exhibitMeta = MEME_EXHIBITS.find((m) => m.id === quizId);
    const alreadyCompleted = localCompletedQuizzes.includes(quizId);

    if (alreadyCompleted) {
      triggerStampAnimation({
        kind: 'quiz',
        title: `“${exhibitMeta?.memeWord || '바른 우리말'}” 정답이에요!`,
        subtitle: '이미 모은 스탬프를 멋지게 다시 확인했어요.',
        isNewStamp: false,
        totalStamps: stampsCountRef.current,
      });
      return;
    }

    const nextQuizzes = [...localCompletedQuizzes, quizId].slice(0, 30);
    const nextStamps = stampsCountRef.current + 1;
    stampsCountRef.current = nextStamps;
    setLocalCompletedQuizzes(nextQuizzes);
    setLocalStampsCount(nextStamps);

    triggerStampAnimation({
      kind: 'quiz',
      title: `“${exhibitMeta?.memeWord || '바른 우리말'}” 퀴즈 도장 획득!`,
      subtitle: '고운 우리말로 마음을 전하는 실력이 쑥쑥 자랐어요.',
      isNewStamp: true,
      totalStamps: nextStamps,
    });

    if (authUser) {
      await updateUserProgress(authUser.uid, {
        completedQuizzes: nextQuizzes,
        stampsCount: nextStamps,
      }).catch(console.error);
    }
  }

  async function handleSaveQa(entry: {
    zone: Exclude<MuseumZoneId, 'atrium'>;
    memeWord: string;
    question: string;
    properKorean: string;
    empathyThought: string;
    answer: string;
  }) {
    const newLocalEntry: QaEntryDoc = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: authUser?.uid || 'local_scholar',
      zone: entry.zone,
      memeWord: entry.memeWord,
      question: entry.question,
      properKorean: entry.properKorean,
      empathyThought: entry.empathyThought,
      answer: entry.answer,
    };
    setLocalQaEntries((prev) => [newLocalEntry, ...prev].slice(0, 40));

    const nextStamps = localStampsCount + 1;
    setLocalStampsCount(nextStamps);

    if (authUser) {
      await saveQaEntry(authUser.uid, entry);
      await updateUserProgress(authUser.uid, { stampsCount: nextStamps }).catch(console.error);
    }
  }

  async function handleDeleteQa(entryId: string) {
    setLocalQaEntries((prev) => prev.filter((e) => e.id !== entryId));
    if (authUser && !entryId.startsWith('local_')) {
      await deleteQaEntry(authUser.uid, entryId).catch(console.error);
    }
  }

  async function handlePublishPhrase(payload: {
    memeWord: string;
    properSentence: string;
    empathyNote: string;
  }) {
    const localPhrase: SharedPhraseDoc = {
      id: `local_phrase_${Date.now()}`,
      authorId: authUser?.uid || 'local_scholar',
      authorNickname: userNickname,
      visibility: 'public',
      memeWord: payload.memeWord,
      properSentence: payload.properSentence,
      empathyNote: payload.empathyNote,
    };
    setLocalSharedPhrases((prev) => [localPhrase, ...prev].slice(0, 24));

    if (authUser) {
      await publishSharedPhrase(authUser.uid, userNickname, payload);
    }
  }

  async function handleUpdateNickname(nickname: string) {
    const clean = nickname.trim().slice(0, 40) || '3학년 학동';
    setUserNickname(clean);
    if (authUser) {
      await updateUserProgress(authUser.uid, { nickname: clean }).catch(console.error);
    }
  }

  const displayQaEntries = authUser ? cloudQaEntries : localQaEntries;
  const displaySharedPhrases = authUser && cloudSharedPhrases.length > 0 ? cloudSharedPhrases : localSharedPhrases;
  const currentZoneMeta = MUSEUM_ZONES.find((z) => z.id === activeZone) || MUSEUM_ZONES[0];

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#EFE6D5]">
      <TopBar
        activeZone={activeZone}
        stampsCount={localStampsCount}
        userNickname={userNickname}
        onSelectZone={(z, teleport) => {
          handleSelectZone(z, teleport);
          setPanelOpen(true);
        }}
        onOpenPassport={() => {
          setActiveZone('lounge');
          setPanelOpen(true);
        }}
      />

      {/* Full-Viewport 3D Seodang Stage */}
      <main className="relative flex-1 overflow-hidden">
        <MuseumCanvas
          avatarColor={avatarColor}
          cameraMode={cameraMode}
          soundEnabled={soundEnabled}
          panelOpen={panelOpen}
          dpadRef={dpadRef}
          teleportTarget={teleportTarget}
          onNearZoneChange={handleNearZoneChange}
          onInteractExhibit={handleInteractExhibit}
        />

        {/* Subtle Top-Left Zone Guidance Banner */}
        <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm">
          <div className="pointer-events-auto rounded-2xl border border-stone-300 bg-[#FFFDF9] px-4 py-3 shadow-md">
            <div className="text-xs font-medium text-slate-500">
              <span>현재 위치</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span style={{ color: currentZoneMeta.accentHex }} className="font-bold">
                {currentZoneMeta.shortName}
              </span>
            </div>
            <div className="font-display mt-0.5 text-base font-bold text-slate-900">
              {currentZoneMeta.title}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleInteractExhibit(activeZone, nearbyPrompt?.exhibitId)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>
                  {nearbyPrompt ? `${nearbyPrompt.title}` : '이 글방 문제 열기'} · Space
                </span>
              </button>
              <button
                type="button"
                onClick={() => speakKorean(`${currentZoneMeta.title}. ${currentZoneMeta.subtitle}`)}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-100 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5 text-sky-600" />
                <span>듣기</span>
              </button>
            </div>
          </div>

          {authError && (
            <div className="pointer-events-auto rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-800 shadow-sm">
              {authError}
            </div>
          )}
        </div>

        <BottomDock
          collapsed={dockCollapsed}
          onToggleCollapse={() => setDockCollapsed((prev) => !prev)}
          activeZone={activeZone}
          cameraMode={cameraMode}
          onToggleCameraMode={() =>
            setCameraMode((prev) => (prev === 'third' ? 'first' : 'third'))
          }
          avatarColor={avatarColor}
          onChangeAvatarColor={handleChangeAvatarColor}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onTeleportZone={(zone) => {
            setActiveZone(zone);
            setTeleportTarget((prev) => ({ zone, seq: (prev?.seq || 0) + 1 }));
            recordZoneVisit(zone);
          }}
          onOpenLounge={() => {
            setActiveZone('lounge');
            setTeleportTarget((prev) => ({ zone: 'lounge', seq: (prev?.seq || 0) + 1 }));
            setPanelOpen(true);
          }}
          onDpadChange={(key, pressed) => {
            dpadRef.current[key] = pressed;
          }}
        />
      </main>

      <ZonePanel
        open={panelOpen}
        activeZone={activeZone}
        selectedExhibitId={selectedExhibitId}
        onSelectZone={(z) => handleSelectZone(z, true)}
        onSelectExhibit={setSelectedExhibitId}
        onClose={() => setPanelOpen(false)}
        isSignedIn={Boolean(authUser)}
        userNickname={userNickname}
        qaEntries={displayQaEntries}
        sharedPhrases={displaySharedPhrases}
        completedQuizzes={localCompletedQuizzes}
        visitedZones={localVisitedZones}
        stampsCount={localStampsCount}
        soundEnabled={soundEnabled}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onCompleteQuiz={handleCompleteQuiz}
        onSaveQa={handleSaveQa}
        onDeleteQa={handleDeleteQa}
        onPublishPhrase={handlePublishPhrase}
        onUpdateNickname={handleUpdateNickname}
      />

      <StampCelebration event={stampEvent} />
    </div>
  );
}
