import { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Heart,
  LogIn,
  LogOut,
  MessageSquarePlus,
  Send,
  Share2,
  Sparkles,
  Square,
  Star,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  MEME_EXHIBITS,
  MUSEUM_ZONES,
  type MemeExhibit,
  type MuseumZoneId,
} from '../data/museumExhibits';
import type { ClassroomQaDoc, QaEntryDoc, SharedPhraseDoc } from '../services/firebase';
import { playMuseumChime, speakKorean, stopSpeaking } from '../utils/audio';
import { askCuratorApi, checkEmpathyApi, checkTransformApi } from '../utils/curatorClient';

import welcomeImgUrl from '../assets/images/seodang_welcome_banner_1794710182161.jpg';
import youngTeacherImgUrl from '../assets/images/seodang_young_teacher_1794712610117.jpg';
import properKoreanImgUrl from '../assets/images/seodang_proper_korean_1794710183145.jpg';
import empathyMirrorImgUrl from '../assets/images/seodang_empathy_mirror_1794710183040.jpg';

interface ZonePanelProps {
  open: boolean;
  activeZone: MuseumZoneId;
  selectedExhibitId: string;
  onSelectZone: (zone: MuseumZoneId) => void;
  onSelectExhibit: (id: string) => void;
  onClose: () => void;
  isSignedIn: boolean;
  canModerateClassroom: boolean;
  userNickname: string;
  qaEntries: QaEntryDoc[];
  classroomQaEntries: ClassroomQaDoc[];
  sharedPhrases: SharedPhraseDoc[];
  completedQuizzes: string[];
  visitedZones: string[];
  stampsCount: number;
  soundEnabled: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onCompleteQuiz: (quizId: string) => void;
  onSaveQa: (entry: {
    zone: Exclude<MuseumZoneId, 'atrium'>;
    memeWord: string;
    question: string;
    properKorean: string;
    empathyThought: string;
    answer: string;
  }) => Promise<void>;
  onDeleteQa: (entryId: string) => Promise<void>;
  onDeleteClassroomQa: (entryId: string) => Promise<void>;
  onPublishPhrase: (payload: {
    memeWord: string;
    properSentence: string;
    empathyNote: string;
  }) => Promise<void>;
  onUpdateNickname: (nickname: string) => Promise<void>;
}

const ZONE_IMAGES: Record<MuseumZoneId, { src: string; alt: string; caption: string }> = {
  atrium: {
    src: welcomeImgUrl,
    alt: '반짝반짝 바른 우리말 서당 대청마루 일러스트',
    caption: '서당 대청마루에서 세 개의 글방을 자유롭게 걸어 다니며 바른 우리말을 익혀 보세요.',
  },
  meme_meaning: {
    src: youngTeacherImgUrl,
    alt: '따봄쌤이 L을 가져가와 67 등 요즘 밈의 뜻을 설명해 주는 1방 일러스트',
    caption: '1방에서는 따봄쌤이 L을 가져가, 67 등 요즘 유행하는 밈의 뜻을 쉽고 재미있게 알려 줘요.',
  },
  proper_korean: {
    src: properKoreanImgUrl,
    alt: '거친 말을 아름다운 우리말 꽃으로 바꾸는 2방 바른말 서예방 일러스트',
    caption: '2방에서는 따봄쌤과 함께 밈이나 줄임말을 따뜻하고 바른 우리말 문장으로 곱게 바꾸어 보아요.',
  },
  empathy_mirror: {
    src: empathyMirrorImgUrl,
    alt: '마음의 거울 앞에서 듣는 사람의 마음을 살펴보는 3방 일러스트',
    caption: '3방에서는 밈의 뜻을 모르는 사람이 들었을 때 어떤 생각이 들지 함께 느껴 봐요.',
  },
  lounge: {
    src: youngTeacherImgUrl,
    alt: '따봄쌤께 질문하고 답하고 설명을 듣는 서당 방 일러스트',
    caption: '궁금한 점을 따봄쌤께 질문하고, 설명을 소리 내어 듣고, 나의 서당 배움첩에 기록해요.',
  },
};

export function ZonePanel({
  open,
  activeZone,
  selectedExhibitId,
  onSelectZone,
  onSelectExhibit,
  onClose,
  isSignedIn,
  canModerateClassroom,
  userNickname,
  qaEntries,
  classroomQaEntries,
  sharedPhrases,
  completedQuizzes,
  visitedZones,
  stampsCount,
  soundEnabled,
  onSignIn,
  onSignOut,
  onCompleteQuiz,
  onSaveQa,
  onDeleteQa,
  onDeleteClassroomQa,
  onPublishPhrase,
  onUpdateNickname,
}: ZonePanelProps) {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  // Quiz state
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [highlightedChoice, setHighlightedChoice] = useState<number>(0);

  // Transform workshop state
  const [studentSentence, setStudentSentence] = useState('');
  const [transformLoading, setTransformLoading] = useState(false);
  const [transformResult, setTransformResult] = useState<{
    praise: string;
    tip: string;
    polishedSentence: string;
    starScore: number;
  } | null>(null);
  const [transformError, setTransformError] = useState<string | null>(null);

  // Empathy mirror state
  const [listenerRole, setListenerRole] = useState('할머니');
  const [customEmpathyMeme, setCustomEmpathyMeme] = useState('');
  const [empathyGuess, setEmpathyGuess] = useState('');
  const [empathyLoading, setEmpathyLoading] = useState(false);
  const [empathyResult, setEmpathyResult] = useState<{
    memeWord: string;
    listenerRole: string;
    listenerThought: string;
    feelingLabel: string;
    gentleAdvice: string;
  } | null>(null);
  const [empathyError, setEmpathyError] = useState<string | null>(null);

  // Q&A Lounge state
  const [askMemeWord, setAskMemeWord] = useState('');
  const [askQuestion, setAskQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askResult, setAskResult] = useState<{
    explanation: string;
    properKorean: string;
    empathyThought: string;
    encouragement: string;
    memeWord: string;
    question: string;
  } | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState('');

  const zoneMeta = MUSEUM_ZONES.find((z) => z.id === activeZone) || MUSEUM_ZONES[0];
  const exhibit: MemeExhibit =
    MEME_EXHIBITS.find((m) => m.id === selectedExhibitId) || MEME_EXHIBITS[0];
  const zoneMedia = ZONE_IMAGES[activeZone];

  useEffect(() => {
    setQuizChoice(null);
    setHighlightedChoice(0);
  }, [selectedExhibitId, activeZone]);

  useEffect(() => {
    if (!open) return;

    const submitQuizChoice = (choiceIdx: number) => {
      setHighlightedChoice(choiceIdx);
      setQuizChoice(choiceIdx);
      if (choiceIdx === exhibit.quiz.correctIndex) {
        if (soundEnabled) playMuseumChime('success');
        onCompleteQuiz(exhibit.id);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();

        if (activeZone !== 'proper_korean') {
          onSelectZone('proper_korean');
          if (soundEnabled) playMuseumChime('discover');
          return;
        }

        if (quizChoice === null) {
          submitQuizChoice(highlightedChoice);
        } else if (quizChoice !== exhibit.quiz.correctIndex) {
          const nextTry = (quizChoice + 1) % exhibit.quiz.choices.length;
          setQuizChoice(null);
          setHighlightedChoice(nextTry);
        } else {
          const currentIdx = MEME_EXHIBITS.findIndex((m) => m.id === exhibit.id);
          const nextExhibit = MEME_EXHIBITS[(currentIdx + 1) % MEME_EXHIBITS.length];
          onSelectExhibit(nextExhibit.id);
          setQuizChoice(null);
          setHighlightedChoice(0);
          if (soundEnabled) playMuseumChime('discover');
        }
        return;
      }

      if (activeZone === 'proper_korean') {
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          setQuizChoice(null);
          setHighlightedChoice(
            (prev) => (prev - 1 + exhibit.quiz.choices.length) % exhibit.quiz.choices.length,
          );
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          setQuizChoice(null);
          setHighlightedChoice((prev) => (prev + 1) % exhibit.quiz.choices.length);
        } else if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') {
          const idx = Number(e.code.replace('Digit', '')) - 1;
          if (idx >= 0 && idx < exhibit.quiz.choices.length) {
            e.preventDefault();
            submitQuizChoice(idx);
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [
    open,
    activeZone,
    exhibit,
    quizChoice,
    highlightedChoice,
    soundEnabled,
    onCompleteQuiz,
    onSelectExhibit,
    onSelectZone,
  ]);

  if (!open) return null;

  function handleSpeak(id: string, text: string) {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    speakKorean(text, {
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
    });
  }

  function flashNotice(msg: string) {
    setStatusNotice(msg);
    window.setTimeout(() => setStatusNotice(null), 3500);
  }

  async function handleSubmitTransform(e: React.FormEvent) {
    e.preventDefault();
    if (!studentSentence.trim()) return;
    setTransformLoading(true);
    setTransformError(null);
    try {
      const data = await checkTransformApi({
        memeWord: exhibit.memeWord,
        studentSentence: studentSentence.trim(),
      });
      setTransformResult(data);
      if (soundEnabled) playMuseumChime('success');
    } catch (err) {
      setTransformError(err instanceof Error ? err.message : '잠시 후 다시 시도해 주세요.');
    } finally {
      setTransformLoading(false);
    }
  }

  async function handleSubmitEmpathy(e: React.FormEvent) {
    e.preventDefault();
    setEmpathyLoading(true);
    setEmpathyError(null);
    try {
      const trimmedCustom = customEmpathyMeme.trim();
      const trimmedGuess = empathyGuess.trim();
      const looksLikeShortMeme =
        !trimmedCustom &&
        trimmedGuess.length >= 1 &&
        trimmedGuess.length <= 15 &&
        !/(기분|생각|당황|서운|모르|화|슬|웃|기쁘|어리둥절|놀|좋아|싫어|것\s*같|할\s*것|될\s*것|궁금|느낌|마음|일까)/.test(trimmedGuess);

      const targetMeme = trimmedCustom || (looksLikeShortMeme ? trimmedGuess : exhibit.memeWord);
      const targetGuess = looksLikeShortMeme ? '' : trimmedGuess;

      const data = await checkEmpathyApi({
        memeWord: targetMeme,
        listenerRole,
        studentGuess: targetGuess,
      });
      setEmpathyResult({
        ...data,
        memeWord: targetMeme,
        listenerRole,
      });
      if (soundEnabled) playMuseumChime('discover');
    } catch (err) {
      setEmpathyError(err instanceof Error ? err.message : '잠시 후 다시 시도해 주세요.');
    } finally {
      setEmpathyLoading(false);
    }
  }

  async function handleSubmitAsk(e: React.FormEvent) {
    e.preventDefault();
    const typedMeme = askMemeWord.trim();
    const typedQuestion = askQuestion.trim();
    if (!typedQuestion && !typedMeme) return;

    setAskLoading(true);
    setAskError(null);
    try {
      const targetQuestion =
        typedQuestion || `${typedMeme}의 뜻과 바른 우리말, 그리고 듣는 사람의 마음이 궁금해요!`;
      const data = await askCuratorApi({
        memeWord: typedMeme,
        question: targetQuestion,
        zone: activeZone,
      });
      const resolvedTopic = data.topicLabel?.trim() || typedMeme || '내가 물어본 말';
      const nextResult = {
        ...data,
        memeWord: resolvedTopic,
        question: targetQuestion,
      };
      setAskResult(nextResult);
      if (soundEnabled) playMuseumChime('success');

      if (resolvedTopic === '조심해야 할 표현') {
        flashNotice('먼저 물어봐 주어서 고마워요! 조심해야 할 말은 우리 반 나눔판에 올라가지 않아요.');
      } else {
        await onSaveQa({
          zone: activeZone === 'atrium' ? 'lounge' : activeZone,
          memeWord: resolvedTopic,
          question: targetQuestion,
          properKorean: data.properKorean || '',
          empathyThought: data.empathyThought || '',
          answer: `${data.explanation} (${data.encouragement})`,
        });
        flashNotice('배움첩과 우리 반 질문 나눔판에 함께 올렸어요!');
      }
    } catch (err) {
      setAskError(err instanceof Error ? err.message : '잠시 후 다시 시도해 주세요.');
    } finally {
      setAskLoading(false);
    }
  }

  return (
    <aside
      aria-label="서당 글방 학습 창"
      className="fixed top-14 right-0 bottom-0 z-30 flex w-full max-w-2xl flex-col border-l border-stone-300 bg-[#FBF6EC] shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#FFFDF9] px-6 py-4">
        <div>
          <div className="text-xs font-medium text-slate-500">
            <span>서당 안내</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span style={{ color: zoneMeta.accentHex }} className="font-semibold">
              {zoneMeta.shortName}
            </span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="tabular-nums">참 잘했어요 도장 {stampsCount}개</span>
          </div>
          <h2 className="font-display mt-1 text-xl font-bold text-slate-900 text-balance">
            {zoneMeta.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">{zoneMeta.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setSpeakingId(null);
            onClose();
          }}
          aria-label="글방 창 닫기"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-slate-700 hover:bg-stone-100 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Room switcher tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-stone-200 bg-stone-100 px-6 py-2">
        {MUSEUM_ZONES.map((z) => {
          const isCurrent = activeZone === z.id;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => {
                setQuizChoice(null);
                onSelectZone(z.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isCurrent ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {z.shortName}
            </button>
          );
        })}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {statusNotice && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Seodang Storybook Illustration Card */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="relative h-48 w-full bg-stone-100">
            {!imgFailed[activeZone] ? (
              <img
                src={zoneMedia.src}
                alt={zoneMedia.alt}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed((prev) => ({ ...prev, [activeZone]: true }))}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-amber-50 p-4 text-center">
                <Sparkles className="h-8 w-8 text-amber-600" />
                <span className="mt-2 text-sm font-semibold text-slate-800">{zoneMeta.title}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-xs leading-relaxed text-slate-700">{zoneMedia.caption}</p>
            <button
              type="button"
              onClick={() => handleSpeak(`zone_${activeZone}`, `${zoneMeta.title}. ${zoneMedia.caption}`)}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-stone-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {speakingId === `zone_${activeZone}` ? (
                <>
                  <Square className="h-3.5 w-3.5 text-rose-600" />
                  <span>멈추기</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-sky-600" />
                  <span>안내 듣기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Meme word selector */}
        {(activeZone === 'meme_meaning' ||
          activeZone === 'proper_korean' ||
          activeZone === 'empathy_mirror') && (
          <div>
            <div className="mb-2 text-xs font-semibold text-slate-600">
              살펴볼 밈 표현을 골라 보세요
            </div>
            <div className="flex flex-wrap gap-2">
              {MEME_EXHIBITS.map((item) => {
                const selected = exhibit.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectExhibit(item.id);
                      setQuizChoice(null);
                      setTransformResult(null);
                      setEmpathyResult(null);
                      setCustomEmpathyMeme('');
                      setEmpathyGuess('');
                      setStudentSentence('');
                    }}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-stone-300 bg-white text-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    {item.memeWord}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ATRIUM: 대청마루 안내 & 배움첩 */}
        {/* ============================================================ */}
        {activeZone === 'atrium' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                3학년 학동님, 반갑습니다!
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                한옥 서당 대청마루 바닥을 클릭하거나 방향키(WASD)를 눌러 학동 캐릭터를 움직여 보세요.
                로그인하지 않아도 세 개의 글방을 모두 체험하고, 따봄쌤께 질문하며 배움첩에 저장할 수 있어요.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MUSEUM_ZONES.filter((z) =>
                  ['meme_meaning', 'proper_korean', 'empathy_mirror'].includes(z.id),
                ).map((z) => {
                  const visited = visitedZones.includes(z.id);
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => onSelectZone(z.id)}
                      className="flex flex-col items-start gap-1.5 rounded-xl border border-stone-200 bg-[#FBF6EC] p-3.5 text-left hover:border-slate-400 cursor-pointer"
                    >
                      <span className="text-xs font-semibold" style={{ color: z.accentHex }}>
                        {visited ? '공부 완료 ✓' : '아직 안 가봄'}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{z.shortName}</span>
                      <span className="text-xs text-slate-600 line-clamp-2">{z.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explorer Nickname & Optional Cloud Sync */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-display text-base font-bold text-slate-900">
                    나의 서당 배움첩
                  </h4>
                  <p className="text-xs text-slate-600">
                    {isSignedIn
                      ? `${userNickname}님의 배움첩이 파이어베이스 클라우드에 함께 저장되고 있어요.`
                      : '로그인 없이도 지금 기기에 자동 저장됩니다. 다른 기기에서도 이어 보려면 구글 연동을 선택해 보세요.'}
                  </p>
                </div>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>연동 해제</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-stone-100 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>클라우드 연동(선택)</span>
                  </button>
                )}
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nicknameDraft.trim()) return;
                  await onUpdateNickname(nicknameDraft.trim());
                  setNicknameDraft('');
                  flashNotice('학동 별명을 바꾸어 저장했어요!');
                }}
                className="flex items-center gap-2 pt-2 border-t border-stone-100"
              >
                <input
                  type="text"
                  maxLength={30}
                  value={nicknameDraft}
                  onChange={(e) => setNicknameDraft(e.target.value)}
                  placeholder={`새 별명 입력 (현재: ${userNickname})`}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-800 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  별명 저장
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1방: 밈 풀이 글방 */}
        {/* ============================================================ */}
        {activeZone === 'meme_meaning' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-sky-700">
                    {exhibit.category}
                  </div>
                  <h3 className="font-display mt-1 text-2xl font-bold text-slate-900">
                    “{exhibit.memeWord}”
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleSpeak(
                      `meaning_${exhibit.id}`,
                      `${exhibit.memeWord}. ${exhibit.meaning} ${exhibit.origin}`,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {speakingId === `meaning_${exhibit.id}` ? (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span>멈추기</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>따봄쌤 설명 듣기</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                <div className="rounded-xl bg-sky-50 p-4">
                  <div className="text-xs font-bold text-sky-800">무슨 뜻인가요?</div>
                  <p className="mt-1 text-slate-900">{exhibit.meaning}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <div className="text-xs font-bold text-slate-700">어떻게 생겨났나요?</div>
                  <p className="mt-1">{exhibit.origin}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <div className="text-xs font-bold text-slate-700">언제 많이 쓰나요?</div>
                  <p className="mt-1">{exhibit.exampleSituation}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectZone('proper_korean')}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  2방에서 바른 우리말로 바꾸기 →
                </button>
                <button
                  type="button"
                  onClick={() => onSelectZone('empathy_mirror')}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-stone-100 cursor-pointer"
                >
                  3방에서 듣는 사람 마음 보기 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2방: 바른말 서예방 */}
        {/* ============================================================ */}
        {activeZone === 'proper_korean' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-emerald-700">
                    고운 말 변신 예시 · {exhibit.memeWord}
                  </div>
                  <h3 className="font-display mt-1 text-lg font-bold text-slate-900">
                    “{exhibit.properKorean}”
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleSpeak(
                      `proper_${exhibit.id}`,
                      `${exhibit.memeWord} 대신 이렇게 말해요. ${exhibit.properKorean}. ${exhibit.properExplanation}`,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {speakingId === `proper_${exhibit.id}` ? (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span>멈추기</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>바른말 듣기</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{exhibit.properExplanation}</p>
            </div>

            {/* 3rd-grade Interactive Quiz with Spacebar solving */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-base font-bold text-slate-900">
                  따봄쌤의 바른 우리말 문제 풀기
                </h4>
                {completedQuizzes.includes(exhibit.id) && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <Award className="h-4 w-4" />
                    도장 획득 완료
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-emerald-700">
                키보드 1·2·3 또는 ↑↓ 이동 후 스페이스바(Space)로 문제를 해결하고 다음 문제로 넘어가요!
              </p>
              <p className="text-sm font-medium text-slate-800">{exhibit.quiz.question}</p>
              <div className="space-y-2">
                {exhibit.quiz.choices.map((choice, idx) => {
                  const picked = quizChoice === idx;
                  const isCorrect = idx === exhibit.quiz.correctIndex;
                  const isHighlighted = quizChoice === null && highlightedChoice === idx;
                  let style = isHighlighted
                    ? 'border-emerald-500 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-400'
                    : 'border-stone-200 bg-stone-50 text-slate-800 hover:bg-stone-100';
                  if (quizChoice !== null) {
                    if (isCorrect) style = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                    else if (picked) style = 'border-rose-400 bg-rose-50 text-rose-900';
                  }
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => {
                        setHighlightedChoice(idx);
                        setQuizChoice(idx);
                        if (idx === exhibit.quiz.correctIndex) {
                          if (soundEnabled) playMuseumChime('success');
                          onCompleteQuiz(exhibit.id);
                        }
                      }}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors cursor-pointer ${style}`}
                    >
                      {idx + 1}. {choice}
                    </button>
                  );
                })}
              </div>
              {quizChoice !== null && (
                <div
                  className={`rounded-xl p-3 text-xs leading-relaxed font-medium ${
                    quizChoice === exhibit.quiz.correctIndex
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'bg-amber-50 text-amber-900'
                  }`}
                >
                  {quizChoice === exhibit.quiz.correctIndex
                    ? `${exhibit.quiz.feedback} (스페이스바를 누르면 다음 밈 문제로 넘어가요!)`
                    : '아쉬워요! 듣는 친구가 기분 좋고 뜻을 바로 알 수 있는 문장을 다시 골라 보세요. (스페이스바로 다시 고르기)'}
                </div>
              )}
            </div>

            {/* Free-writing Proper Korean Practice + Gemini Young Teacher Coaching */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <div>
                <h4 className="font-display text-base font-bold text-slate-900">
                  직접 바른 우리말로 바꾸어 보기
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  “{exhibit.memeWord}” 대신 내가 쓰고 싶은 예쁜 우리말 문장을 만들어 따봄쌤께 보여 드려요.
                </p>
              </div>
              <form onSubmit={handleSubmitTransform} className="space-y-3">
                <textarea
                  rows={2}
                  maxLength={180}
                  value={studentSentence}
                  onChange={(e) => setStudentSentence(e.target.value)}
                  placeholder={`예: ${exhibit.properKorean}`}
                  className="w-full rounded-xl border border-stone-300 bg-[#FBF6EC] p-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={transformLoading || !studentSentence.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{transformLoading ? '따봄쌤이 읽고 있어요...' : '따봄쌤께 칭찬받기'}</span>
                  </button>
                </div>
              </form>

              {transformError && (
                <p className="text-xs font-medium text-rose-700">{transformError}</p>
              )}

              {transformResult && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">따봄쌤의 칭찬</span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: Math.min(3, Math.max(1, transformResult.starScore)) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800">{transformResult.praise}</p>
                  <p className="text-xs text-slate-700">{transformResult.tip}</p>
                  <div className="rounded-lg bg-white p-3 text-sm font-semibold text-emerald-900">
                    추천 문장: “{transformResult.polishedSentence}”
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          'transform_res',
                          `${transformResult.praise} 추천 문장: ${transformResult.polishedSentence}`,
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>설명 듣기</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onSaveQa({
                          zone: 'proper_korean',
                          memeWord: exhibit.memeWord,
                          question: `내가 바꾼 문장: ${studentSentence}`,
                          properKorean: transformResult.polishedSentence,
                          empathyThought: '',
                          answer: `${transformResult.praise} ${transformResult.tip}`,
                        });
                        flashNotice('나의 서당 배움첩에 저장했어요!');
                      }}
                      className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                      <span>배움첩에 저장</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onPublishPhrase({
                          memeWord: exhibit.memeWord,
                          properSentence: studentSentence.trim() || transformResult.polishedSentence,
                          empathyNote: transformResult.polishedSentence,
                        });
                        flashNotice('서당 바른말 게시대에 자랑했어요!');
                      }}
                      className="flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>게시대에 자랑하기</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3방: 마음 거울방 */}
        {/* ============================================================ */}
        {activeZone === 'empathy_mirror' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <div>
                <div className="text-xs font-medium text-rose-700">
                  뜻을 모르는 사람이 “{exhibit.memeWord}”을(를) 들었을 때
                </div>
                <h3 className="font-display mt-1 text-lg font-bold text-slate-900">
                  듣는 사람의 마음속 생각 들여다보기
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {exhibit.empathyListeners.map((listener, idx) => (
                  <div
                    key={listener.role}
                    className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-rose-950">{listener.role}의 마음</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeak(
                            `emp_${exhibit.id}_${idx}`,
                            `${listener.role}의 마음이에요. ${listener.thought}`,
                          )
                        }
                        className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>듣기</span>
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-800">“{listener.thought}”</p>
                    <div className="text-xs font-semibold text-rose-700">
                      느끼는 기분 · {listener.feeling}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Empathy Question */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <div>
                <h4 className="font-display text-base font-bold text-slate-900">
                  내가 직접 다른 사람의 마음 물어보기
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  누구에게 “{customEmpathyMeme.trim() || exhibit.memeWord}”이라고 말했을 때 어떤 생각이 들지 함께 살펴볼까요?
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['할머니', '할아버지', '새로 온 전학생 친구', '1학년 동생', '담임 선생님'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setListenerRole(role);
                      setEmpathyResult(null);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      listenerRole === role
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmitEmpathy} className="space-y-3">
                <div>
                  <label htmlFor="empathy-custom-meme" className="block text-xs font-semibold text-slate-700 mb-1">
                    들어볼 말 · 밈 직접 적기 (비워 두면 선택된 “{exhibit.memeWord}”로 살펴봐요)
                  </label>
                  <input
                    id="empathy-custom-meme"
                    type="text"
                    maxLength={60}
                    value={customEmpathyMeme}
                    onChange={(e) => {
                      setCustomEmpathyMeme(e.target.value);
                      setEmpathyResult(null);
                    }}
                    placeholder={`예: 야르, 럭키비키, 67... (비워 두면 '${exhibit.memeWord}')`}
                    className="w-full rounded-xl border border-stone-300 bg-[#FBF6EC] px-3.5 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="empathy-guess" className="block text-xs font-semibold text-slate-700 mb-1">
                    내가 짐작한 {listenerRole}의 기분 (비워 두고 바로 물어보기도 가능)
                  </label>
                  <input
                    id="empathy-guess"
                    type="text"
                    maxLength={200}
                    value={empathyGuess}
                    onChange={(e) => setEmpathyGuess(e.target.value)}
                    placeholder={`${listenerRole}은(는) 어떤 기분이나 생각이 들 것 같나요?`}
                    className="w-full rounded-xl border border-stone-300 bg-[#FBF6EC] px-3.5 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={empathyLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  <Heart className="h-4 w-4" />
                  <span>{empathyLoading ? '마음 거울을 비추는 중...' : `${listenerRole} 마음 거울 보기`}</span>
                </button>
              </form>

              {empathyError && <p className="text-xs font-medium text-rose-700">{empathyError}</p>}

              {empathyResult && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2.5">
                  <div className="text-xs font-bold text-rose-800">
                    “{empathyResult.memeWord}”을(를) 들은 {empathyResult.listenerRole}의 생각 · {empathyResult.feelingLabel}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-900">
                    “{empathyResult.listenerThought}”
                  </p>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {empathyResult.gentleAdvice}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          'empathy_ai',
                          `${empathyResult.memeWord}을 들은 ${empathyResult.listenerRole}의 생각이에요. ${empathyResult.listenerThought} ${empathyResult.gentleAdvice}`,
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-100 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>설명 듣기</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onSaveQa({
                          zone: 'empathy_mirror',
                          memeWord: empathyResult.memeWord,
                          question: `${empathyResult.listenerRole}이(가) '${empathyResult.memeWord}'을 들었을 때의 마음`,
                          properKorean:
                            exhibit.memeWord === empathyResult.memeWord ? exhibit.properKorean : '',
                          empathyThought: empathyResult.listenerThought,
                          answer: empathyResult.gentleAdvice,
                        });
                        flashNotice('마음 거울 기록을 배움첩과 우리 반 나눔판에 저장했어요!');
                      }}
                      className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                      <span>배움첩에 저장</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* LOUNGE: 따봄쌤 질문·답변·듣기방 */}
        {/* ============================================================ */}
        {activeZone === 'lounge' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  따봄쌤께 질문하고 설명 듣기
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  L을 가져가, 67(식스세븐) 등 친구들 사이에서 들은 궁금한 밈을 적고 질문하면, 뜻과 바른 우리말, 모르는 사람의 생각까지 알려 드려요.
                </p>
              </div>

              <form onSubmit={handleSubmitAsk} className="space-y-3">
                <div>
                  <label htmlFor="ask-meme" className="block text-xs font-semibold text-slate-700 mb-1">
                    궁금한 밈이나 유행어 (비워 두고 질문만 적어도 돼요)
                  </label>
                  <input
                    id="ask-meme"
                    type="text"
                    maxLength={60}
                    value={askMemeWord}
                    onChange={(e) => {
                      setAskMemeWord(e.target.value);
                      setAskResult(null);
                    }}
                    placeholder="예: L을 가져가, 67(식스세븐), 럭키비키..."
                    className="w-full rounded-xl border border-stone-300 bg-[#FBF6EC] px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="ask-q" className="block text-xs font-semibold text-slate-700 mb-1">
                    따봄쌤께 묻고 싶은 질문
                  </label>
                  <textarea
                    id="ask-q"
                    rows={2}
                    maxLength={240}
                    value={askQuestion}
                    onChange={(e) => setAskQuestion(e.target.value)}
                    placeholder="예: 이 말을 할머니 앞에서 쓰면 어떤 생각이 드실까요? 바른 우리말로는 어떻게 말해요?"
                    className="w-full rounded-xl border border-stone-300 bg-[#FBF6EC] p-3 text-sm text-slate-900 focus:border-violet-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={askLoading || (!askMemeWord.trim() && !askQuestion.trim())}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{askLoading ? '따봄쌤이 답변을 적는 중...' : '질문하고 답변 듣기'}</span>
                </button>
              </form>

              {askError && <p className="text-xs font-medium text-rose-700">{askError}</p>}

              {askResult && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-violet-950">
                      “{askResult.memeWord}” 따봄쌤 풀이
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          'ask_result',
                          `${askResult.memeWord} 풀이예요. ${askResult.explanation} 바른 우리말로는 이렇게 말해요. ${askResult.properKorean} 뜻을 모르는 사람의 생각이에요. ${askResult.empathyThought}`,
                        )
                      }
                      className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 cursor-pointer"
                    >
                      {speakingId === 'ask_result' ? (
                        <>
                          <Square className="h-3.5 w-3.5" />
                          <span>멈추기</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>전체 설명 듣기</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-slate-800">
                    <p><strong className="text-sky-800">1. 뜻 설명:</strong> {askResult.explanation}</p>
                    <p><strong className="text-emerald-800">2. 바른 우리말:</strong> {askResult.properKorean}</p>
                    <p><strong className="text-rose-800">3. 모르는 사람의 마음:</strong> {askResult.empathyThought}</p>
                    <p className="text-xs font-medium text-violet-800 pt-1">{askResult.encouragement}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Classroom Q&A Board (synced across students & teacher without login) */}
            <div className="rounded-2xl border border-violet-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-base font-bold text-slate-900">
                    우리 반 질문·답변 나눔판 (실시간 연동)
                  </h4>
                  <p className="text-xs text-slate-500">
                    선생님과 친구들이 물어본 질문과 따봄쌤 풀이가 로그인 없이도 실시간으로 함께 보여요.
                  </p>
                </div>
                <span className="text-xs font-semibold text-violet-700 tabular-nums whitespace-nowrap shrink-0">
                  {classroomQaEntries.length}개 공유됨
                </span>
              </div>

              {classroomQaEntries.length === 0 ? (
                <p className="rounded-xl bg-stone-50 p-4 text-xs text-slate-500 text-center">
                  아직 우리 반 나눔판에 올라온 질문이 없어요. 첫 번째 질문을 보내 보세요!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {classroomQaEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-violet-100 bg-[#FAF7FF] p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-violet-800 whitespace-nowrap shrink-0">
                            {entry.authorNickname}
                          </span>
                          <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {entry.memeWord}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleSpeak(
                                `class_${entry.id}`,
                                `${entry.authorNickname}의 질문이에요. ${entry.question}. ${entry.answer} ${entry.properKorean ? `바른 우리말: ${entry.properKorean}` : ''}`,
                              )
                            }
                            aria-label="우리 반 질문 답변 듣기"
                            className="rounded-md p-1.5 text-slate-600 hover:bg-violet-100 cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          {canModerateClassroom && (
                            <button
                              type="button"
                              onClick={() => onDeleteClassroomQa(entry.id)}
                              aria-label="우리 반 나눔판에서 삭제"
                              className="rounded-md p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-700">Q. {entry.question}</p>
                      <p className="text-xs leading-relaxed text-slate-800">{entry.answer}</p>
                      {entry.properKorean && (
                        <p className="text-xs font-semibold text-emerald-700">
                          바른 말: {entry.properKorean}
                        </p>
                      )}
                      {entry.empathyThought && (
                        <p className="text-xs text-rose-700">
                          듣는 사람 마음: {entry.empathyThought}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Q&A Notebook (works immediately without login) */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-base font-bold text-slate-900">
                  나의 서당 질문·답변 배움첩
                </h4>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {qaEntries.length}개 기록
                </span>
              </div>

              {qaEntries.length === 0 ? (
                <p className="rounded-xl bg-stone-50 p-4 text-xs text-slate-500 text-center">
                  아직 저장된 기록이 없어요. 위에서 따봄쌤께 궁금한 밈을 질문하면 자동으로 저장돼요!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {qaEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-stone-200 bg-[#FBF6EC] p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {entry.memeWord}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleSpeak(
                                `note_${entry.id}`,
                                `${entry.memeWord}. ${entry.answer} ${entry.properKorean ? `바른 우리말: ${entry.properKorean}` : ''}`,
                              )
                            }
                            aria-label="배움첩 소리 내어 듣기"
                            className="rounded-md p-1.5 text-slate-600 hover:bg-stone-200 cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteQa(entry.id)}
                            aria-label="기록 삭제"
                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-600">Q. {entry.question}</p>
                      <p className="text-xs leading-relaxed text-slate-800">{entry.answer}</p>
                      {entry.properKorean && (
                        <p className="text-xs font-semibold text-emerald-700">
                          바른 말: {entry.properKorean}
                        </p>
                      )}
                      {entry.empathyThought && (
                        <p className="text-xs text-rose-700">
                          듣는 사람 마음: {entry.empathyThought}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Seodang Board (works immediately without login) */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-base font-bold text-slate-900">
                  서당 학동들의 바른말 게시대
                </h4>
                <span className="text-xs text-slate-500 tabular-nums">
                  {sharedPhrases.length}개 작품
                </span>
              </div>
              {sharedPhrases.length === 0 ? (
                <p className="rounded-xl bg-stone-50 p-3.5 text-xs text-slate-500">
                  2방 바른말 서예방에서 나만의 고운 말 문장을 만들어 게시대에 올려 보세요!
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {sharedPhrases.map((p) => (
                    <div key={p.id} className="rounded-xl border border-stone-200 bg-[#FBF6EC] p-3 space-y-1">
                      <div className="text-xs text-slate-500">
                        <span>{p.authorNickname}</span>
                        <span className="mx-1" aria-hidden="true">·</span>
                        <span className="font-semibold text-amber-700">{p.memeWord}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">“{p.properSentence}”</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
