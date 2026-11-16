import { MEME_EXHIBITS } from '../data/museumExhibits';

export interface AskCuratorResponse {
  topicLabel?: string;
  explanation: string;
  properKorean: string;
  empathyThought: string;
  encouragement: string;
}

export interface TransformCheckResponse {
  praise: string;
  tip: string;
  polishedSentence: string;
  starScore: number;
}

export interface EmpathyMirrorResponse {
  listenerThought: string;
  feelingLabel: string;
  gentleAdvice: string;
}

interface KnownMemeInfo {
  keywords: string[];
  label: string;
  explanation: string;
  properKorean: string;
  empathyThought: string;
}

const KNOWN_MEMES: KnownMemeInfo[] = [
  ...MEME_EXHIBITS.map((m) => ({
    keywords:
      m.id === 'take_the_l'
        ? ['l을 가져가', 'take the l', '엘을 가져가', 'l가져가']
        : m.id === 'six_seven'
        ? ['67', '식스세븐', '식스 세븐', 'six seven', 'six-seven']
        : [m.memeWord.toLowerCase()],
    label: m.memeWord,
    explanation: `${m.meaning} ${m.origin}`,
    properKorean: m.properKorean,
    empathyThought: `${m.empathyListeners[0]?.role || '듣는 사람'}은(는) “${m.empathyListeners[0]?.thought || '무슨 뜻인지 몰라 당황스러워요.'}”라고 생각할 수 있어요.`,
  })),
  {
    keywords: ['럭키비키', '원영적 사고'],
    label: '럭키비키',
    explanation: '‘행운(Lucky)’과 영어 이름 ‘비키(Vicky)’를 합쳐, 속상하거나 힘든 일이 생겨도 “오히려 나에게 좋은 일이 될 거야!” 하고 긍정적으로 생각하는 유행어예요.',
    properKorean: '조금 아쉽지만 덕분에 더 좋은 기회가 올 거라고 생각하니 힘이 나!',
    empathyThought: '이 말을 처음 듣는 할머니나 동생은 ‘비키가 누구 이름이지?’ 하며 뜻을 바로 떠올리지 못해 어리둥절할 수 있어요.',
  },
  {
    keywords: ['중꺾마'],
    label: '중꺾마',
    explanation: '‘중요한 것은 꺾이지 않는 마음’이라는 긴 문장을 앞 글자만 따서 세 글자로 줄인 말로, 포기하지 말자는 뜻이에요.',
    properKorean: '어렵더라도 끝까지 포기하지 않는 마음이 가장 중요해! 우리 힘내 보자.',
    empathyThought: '줄임말을 모르는 어른들은 ‘중꺾마’가 무슨 물건이나 동물 이름인지 몰라 대화를 이해하기 어려워하세요.',
  },
  {
    keywords: ['완내스'],
    label: '완내스',
    explanation: '‘완전 내 스타일(내가 정말 좋아하는 모습이나 취향)’을 줄여서 부르는 말이에요.',
    properKorean: '와, 이거 정말 내 마음에 쏙 들고 참 멋지다!',
    empathyThought: '외국어나 줄임말이 익숙하지 않은 사람은 암호처럼 들려 어떤 점이 좋다는 건지 알기 어려워요.',
  },
  {
    keywords: ['갓생'],
    label: '갓생',
    explanation: '부지런하고 알차게 하루를 보내며 열심히 노력하는 멋진 생활을 뜻하는 유행어예요.',
    properKorean: '오늘 계획한 일을 차근차근 실천해서 정말 보람차고 뿌듯한 하루였어!',
    empathyThought: '뜻을 모르는 친구나 어르신은 ‘갑자기 왜 신(God) 이야기를 하지?’ 하고 고개를 갸웃하실 수 있어요.',
  },
  {
    keywords: ['느좋'],
    label: '느좋',
    explanation: '‘느낌 좋다’를 두 글자로 줄여서, 분위기나 모습이 참 멋지고 마음에 든다고 표현할 때 쓰는 말이에요.',
    properKorean: '여기 분위기가 정말 따뜻하고 기분이 참 좋네요!',
    empathyThought: '글자를 너무 많이 줄이면 처음 듣는 사람은 무슨 뜻인지 짐작조차 하기 어려워 소외감을 느낄 수 있어요.',
  },
  {
    keywords: ['만반잘부'],
    label: '만반잘부',
    explanation: '‘만나서 반가워, 잘 부탁해’라는 인사말을 앞 글자만 따서 줄인 말이에요.',
    properKorean: '만나서 정말 반가워요! 앞으로 우리 사이좋게 지내요.',
    empathyThought: '처음 만난 친구에게 줄임말로 인사하면 장난치는 것처럼 보이거나 서먹하게 느껴질 수 있어요.',
  },
  {
    keywords: ['스불재'],
    label: '스불재',
    explanation: '‘스스로 불러온 재앙’을 줄여서, 내가 한 행동 때문에 곤란한 일이 생겼을 때 쓰는 말이에요.',
    properKorean: '내가 미리 준비하지 않아서 이런 일이 생겼네. 다음엔 꼭 미리 챙겨야지!',
    empathyThought: '‘재앙’이라는 무서운 말의 줄임말이라 뜻을 모르면 놀라거나 무슨 큰일이 난 줄 알 수 있어요.',
  },
  {
    keywords: ['잼민이'],
    label: '잼민이',
    explanation: '어린 학생이나 초등학생을 장난스럽게 부르던 인터넷 유행어지만, 듣는 사람이 놀림받는다고 느낄 수 있는 말이에요.',
    properKorean: '귀여운 동생 / 씩씩한 우리 초등학생 친구',
    empathyThought: '당사자인 초등학생 친구가 들으면 나를 낮춰 부르며 놀리는 것 같아 마음이 많이 상하고 속상할 수 있어요.',
  },
  {
    keywords: ['알잘딱깔센'],
    label: '알잘딱깔센',
    explanation: '‘알아서 잘 딱 깔끔하고 센스 있게’라는 말을 앞 글자만 모아서 줄인 유행어예요.',
    properKorean: '상황에 맞게 꼼꼼하고 정성스럽게 잘 해 주어서 정말 고마워!',
    empathyThought: '여섯 글자나 되는 줄임말은 듣는 사람이 무슨 뜻인지 한참 생각해도 알 수 없어 대화가 끊어질 수 있어요.',
  },
  {
    keywords: ['tmi', '티엠아이'],
    label: 'TMI',
    explanation: '영어 ‘Too Much Information’의 줄임말로, 굳이 알지 않아도 될 만큼 시시콜콜하고 너무 많은 정보라는 뜻이에요.',
    properKorean: '참고로 이런 작은 이야기도 있단다! / 내가 덧붙여서 말해 줄게.',
    empathyThought: '열심히 이야기했는데 상대가 TMI라고 하면 “내 이야기가 지루하고 듣기 싫은가?” 하며 서운할 수 있어요.',
  },
  {
    keywords: ['폼 미쳤다', '폼미쳤다'],
    label: '폼 미쳤다',
    explanation: '어떤 일을 하는 실력이나 모습이 평소보다 훨씬 뛰어나고 대단하다는 뜻으로 감탄할 때 쓰는 유행어예요.',
    properKorean: '우와, 오늘 실력이 정말 대단하고 눈부시게 멋지다!',
    empathyThought: '‘미쳤다’라는 거친 단어가 들어가 있어서 어르신이나 어린 동생이 들으면 나쁜 말이나 욕설로 오해할 수 있어요.',
  },
  {
    keywords: ['팩폭'],
    label: '팩폭',
    explanation: '‘팩트(사실) 폭격’의 줄임말로, 상대방이 아파할 만한 사실을 너무 세고 직설적으로 말할 때 쓰는 말이에요.',
    properKorean: '솔직한 내 생각도 조심스럽게 나누어 줄게. 함께 더 좋은 방법을 찾아보자!',
    empathyThought: '‘폭격’이라는 거친 표현 때문에 듣는 친구가 비난받았다고 느끼며 마음의 상처를 입을 수 있어요.',
  },
  {
    keywords: ['갑분싸'],
    label: '갑분싸',
    explanation: '‘갑자기 분위기 싸해짐’을 줄여서, 즐겁던 분위기가 갑자기 어색하고 조용해졌을 때 쓰는 말이에요.',
    properKorean: '조금 어색해졌네! 우리 다시 즐거운 이야기로 분위기를 풀어 보자.',
    empathyThought: '이 말을 들은 사람은 “혹시 내가 실수해서 분위기가 안 좋아졌나?” 하고 눈치를 보며 위축될 수 있어요.',
  },
];

function extractTopicFromInputs(memeWord: string, question: string): string {
  if (memeWord.trim()) return memeWord.trim();
  const q = question.trim();
  const quoted = q.match(/['"“‘]([^'"”’]+)['"”’]/);
  if (quoted?.[1]) return quoted[1].trim();

  const cleaned = q
    .replace(/(의\s*)?(뜻을?|의미를?|무슨\s*뜻|뭐예요|뭐야|알려\s*줘|알려\s*주세요|설명해\s*줘|설명해\s*주세요|궁금해요|궁금해|무슨\s*말|어떻게\s*바꿔|사용해도\s*되나요|써도\s*되나요|\?|\.|!)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length >= 1 && cleaned.length <= 24) {
    return cleaned;
  }
  return q.slice(0, 20) || '궁금한 우리말';
}

async function postJsonSafe<T>(url: string, body: unknown, timeoutMs = 18000): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage?: string;
}> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const rawText = await res.text();
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null;
    } catch {
      parsed = null;
    }

    if (!res.ok || !parsed) {
      return {
        ok: false,
        status: res.status,
        data: null,
        errorMessage:
          typeof parsed?.error === 'string'
            ? parsed.error
            : `서버 응답 형식 오류 (${res.status})`,
      };
    }

    return { ok: true, status: res.status, data: parsed as T };
  } catch {
    return { ok: false, status: 0, data: null, errorMessage: '네트워크 연결 오류' };
  } finally {
    window.clearTimeout(timer);
  }
}

function buildFallbackAsk(memeWord: string, question: string): AskCuratorResponse {
  const combined = `${memeWord} ${question}`.toLowerCase();
  const matched = KNOWN_MEMES.find((item) =>
    item.keywords.some((kw) => combined.includes(kw.toLowerCase())),
  );

  if (matched) {
    return {
      topicLabel: memeWord.trim() || matched.label,
      explanation: matched.explanation,
      properKorean: matched.properKorean,
      empathyThought: matched.empathyThought,
      encouragement: '궁금한 밈을 그대로 따라 쓰지 않고 따봄쌤에게 먼저 물어봐 주어서 정말 멋져요!',
    };
  }

  const topic = extractTopicFromInputs(memeWord, question);
  return {
    topicLabel: topic,
    explanation: `“${topic}”에 대해 궁금해졌군요! 친구들 사이나 인터넷에서 새로 유행하는 줄임말·신조어는 재미로 쓰기도 하지만, 뜻이 정확히 전해지지 않거나 상대를 놀리는 말로 오해받기 쉬워요.`,
    properKorean: `“${topic}” 대신 지금 내 마음과 상황을 누구나 바로 알아들을 수 있는 다정한 우리말로 풀어서 말해 보아요.`,
    empathyThought: `이 표현을 처음 듣는 할머니·할아버지나 전학 온 친구는 ‘무슨 암호를 말하는 걸까? 나만 빼고 이야기하는 걸까?’ 하며 당황하거나 서운한 마음이 들 수 있어요.`,
    encouragement: '스스로 뜻을 확인하고 바른 우리말을 찾으려는 3학년 학동의 마음이 정말 기특해요!',
  };
}

function buildFallbackTransform(memeWord: string, studentSentence: string): TransformCheckResponse {
  const clean = studentSentence.trim();
  const hasPoliteEnding = /(요|다|자|까|네|고마워|미안|같이|함께|좋|괜찮)/.test(clean);
  const lengthGood = clean.length >= 6;
  const starScore = hasPoliteEnding && lengthGood ? 3 : 2;

  return {
    praise: `“${memeWord}” 대신 “${clean}”라고 직접 바꾸어 본 점이 정말 훌륭해요! 상대방의 기분까지 생각하며 정성껏 우리말로 풀어 썼네요.`,
    tip: hasPoliteEnding
      ? '상대방을 배려하는 따뜻함이 문장에 아주 잘 담겨 있어요!'
      : '문장 끝에 부드러운 인사나 상대방을 응원하는 말을 조금만 더 붙이면 훨씬 고운 말이 돼요.',
    polishedSentence: clean.endsWith('.') || clean.endsWith('!') || clean.endsWith('?') ? clean : `${clean}!`,
    starScore,
  };
}

function buildFallbackEmpathy(memeWord: string, listenerRole: string, studentGuess: string): EmpathyMirrorResponse {
  const exhibit = MEME_EXHIBITS.find((m) => m.memeWord === memeWord);
  const preset = exhibit?.empathyListeners.find((l) => listenerRole.includes(l.role) || l.role.includes(listenerRole));

  if (preset) {
    return {
      listenerThought: preset.thought,
      feelingLabel: preset.feeling,
      gentleAdvice: studentGuess.trim()
        ? `“${studentGuess.trim()}”라고 생각해 본 우리 학동의 마음이 정말 따뜻해요! 뜻을 모르는 ${listenerRole}께는 “${exhibit?.properKorean}”처럼 쉽게 풀어서 말해 드려요.`
        : `${listenerRole}께서도 대화를 함께 즐길 수 있도록 “${exhibit?.properKorean}”처럼 바른 우리말로 전하면 마음이 훨씬 가까워져요.`,
    };
  }

  return {
    listenerThought: `갑자기 “${memeWord}”라는 말을 들으니 무슨 뜻인지 몰라 머릿속에 물음표가 가득 떠올라요. 혹시 나를 놀리거나 나만 모르는 이야기를 하는 건 아닐까 조금 서운하고 낯선 기분이 들어요.`,
    feelingLabel: '어리둥절하고 낯선 기분',
    gentleAdvice: studentGuess.trim()
      ? `우리 학동이 “${studentGuess.trim()}”라고 짐작해 본 것처럼, 상대방의 마음을 먼저 헤아려 주고 “${exhibit?.properKorean || '누구나 알기 쉬운 바른 우리말'}”로 이야기해 주면 모두가 웃을 수 있어요!`
      : `듣는 ${listenerRole}의 마음을 한 번 더 떠올리며 “${exhibit?.properKorean || '누구나 바로 알 수 있는 고운 우리말'}”로 바꾸어 말해 보아요.`,
  };
}

export async function askCuratorApi(payload: {
  memeWord: string;
  question: string;
  zone: string;
}): Promise<AskCuratorResponse> {
  const res = await postJsonSafe<AskCuratorResponse>('/api/curator/ask', payload);
  if (res.ok && res.data?.explanation) {
    return res.data;
  }
  if (res.status === 400 && res.errorMessage) {
    throw new Error(res.errorMessage);
  }
  return buildFallbackAsk(payload.memeWord, payload.question);
}

export async function checkTransformApi(payload: {
  memeWord: string;
  studentSentence: string;
}): Promise<TransformCheckResponse> {
  const res = await postJsonSafe<TransformCheckResponse>('/api/curator/check-transform', payload);
  if (res.ok && res.data?.praise) {
    return res.data;
  }
  if (res.status === 400 && res.errorMessage) {
    throw new Error(res.errorMessage);
  }
  return buildFallbackTransform(payload.memeWord, payload.studentSentence);
}

export async function checkEmpathyApi(payload: {
  memeWord: string;
  listenerRole: string;
  studentGuess: string;
}): Promise<EmpathyMirrorResponse> {
  const res = await postJsonSafe<EmpathyMirrorResponse>('/api/curator/empathy', payload);
  if (res.ok && res.data?.listenerThought) {
    return res.data;
  }
  if (res.status === 400 && res.errorMessage) {
    throw new Error(res.errorMessage);
  }
  return buildFallbackEmpathy(payload.memeWord, payload.listenerRole, payload.studentGuess);
}
