import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

let cachedAi: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!cachedAi) {
    cachedAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedAi;
}

function extractJson<T>(rawText: string | undefined): T | null {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function generateWithRetry<T>(
  fn: (ai: GoogleGenAI) => Promise<{ text?: string }>,
): Promise<T> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('NO_API_KEY');
  }

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fn(ai);
      const parsed = extractJson<T>(response.text);
      if (parsed) return parsed;
      lastErr = new Error('INVALID_JSON');
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('GENERATION_FAILED');
}

function isRestrictedForElementary(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  if (/(시발|씨발|씨팔|씨바|병신|지랄|개새끼|개새|느금|엄창|창녀|야동|야짤|섹스|에로|음란|19금|성인물|성관계|포르노|성폭력|성희롱|섹드립|패드립|부랄|존나|개존|엠창|썅|쌍년|쌍놈|미친놈|미친년|걸레년)/i.test(normalized)) {
    return true;
  }
  if (/(?:^|[^가-힣])(보지|자지|꼬추|야스|야사|변태|섹|자위)(?:$|[^가-힣]|을|를|이|가|은|는|야|라|임)/i.test(normalized)) {
    return true;
  }
  if (/(?:^|[^가-힣a-zA-Z0-9])(ㅅㅂ|ㅆㅂ|ㅂㅅ|ㅈㄹ|ㄱㅅㄲ|ㅈㄴ|ㄴㄱㅁ|ㄲㅈ)(?:$|[^가-힣a-zA-Z0-9])/.test(normalized)) {
    return true;
  }
  if (/\b(fuck|fucking|shit|bitch|asshole|dick|pussy|cock|porn|sex|nsfw|hentai|whore|slut|wtf)\b/i.test(normalized)) {
    return true;
  }
  return false;
}

const ELEMENTARY_SAFETY_RULE = `
[초등학교 3학년 아동 보호 절대 규칙 - 반드시 지키세요]
- 학생이 입력한 표현이 욕설, 비속어, 혐오 표현, 폭력적인 말, 또는 성(性)·신체 비하·19금 어른용 유행어이거나 초등학교 3학년 학생에게 설명하기 부적절한 내용이라면:
  1) 절대 그 말의 원래 뜻이나 성적인 의미, 욕설의 유래를 풀어서 알려 주지 마세요. (학생들이 비속어나 어른용 표현의 뜻을 알게 되면 안 됩니다.)
  2) 비속어나 부적절한 단어를 답변 속에 그대로 따라 적지 마세요.
  3) "이 말은 초등학생이 뜻을 배우거나 사용하는 말이 아니라, 어른들이나 인터넷에서 조심해야 하는 거칠고 부적절한 표현이에요."라고 다정하고 분명하게 안내하세요.
  4) 대신 평소에 마음을 표현할 때 쓸 수 있는 따뜻하고 건강한 바른 우리말을 제안해 주세요.`.trim();

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/curator/ask', async (req, res) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim().slice(0, 240) : '';
    const memeWord = typeof req.body?.memeWord === 'string' ? req.body.memeWord.trim().slice(0, 60) : '';
    const zone = typeof req.body?.zone === 'string' ? req.body.zone.trim().slice(0, 40) : 'lounge';

    if (!question && !memeWord) {
      return res.status(400).json({ error: '질문이나 궁금한 밈 단어를 입력해 주세요.' });
    }

    if (isRestrictedForElementary(`${memeWord} ${question}`)) {
      return res.json({
        topicLabel: '조심해야 할 표현',
        explanation:
          '방금 물어본 말은 초등학교 3학년 학생들이 사용하는 말이 아니에요. 어른들이나 일부 인터넷에서 쓰이는 거친 말 또는 성·신체와 관련된 부적절한 표현이라서, 구체적인 뜻을 배우거나 따라 말하지 않는 것이 안전해요.',
        properKorean:
          '기쁘거나 속상하거나 놀란 마음을 전할 때는 “정말 대단해!”, “조금 속상한 일이 있었어”처럼 서로 기분 좋아지는 바른 우리말을 써 보아요.',
        empathyThought:
          '이런 부적절하거나 거친 말을 들은 할머니·친구·선생님은 깜짝 놀라며 “어디서 이런 말을 들었을까?” 하고 많이 걱정하고 마음이 상하실 수 있어요.',
        encouragement:
          '모르는 말을 함부로 따라 쓰지 않고 따봄쌤에게 먼저 확인해 주어서 정말 안전하고 현명해요!',
      });
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return res.status(503).json({ error: '따봄쌤 연결 설정을 확인해 주세요.' });
    }

    const promptText = `
[학생 입력 정보]
- 현재 학습 방: ${zone}
- 학생이 적은 궁금한 단어/밈(비어 있을 수 있음): "${memeWord || '(적지 않음)'}"
- 학생이 실제로 보낸 질문: "${question || `${memeWord}의 뜻과 바른 우리말, 듣는 사람의 마음이 궁금해요!`}"

${ELEMENTARY_SAFETY_RULE}

[답변 작성 규칙]
1. 먼저 위 [아동 보호 절대 규칙]에 해당하는지 판단하세요. 해당한다면 절대 원래 뜻이나 성적·비속어 의미를 설명하지 말고, "학생들이 사용하는 말이 아니며 뜻도 배울 필요가 없는 부적절한 표현"이라고 안내하세요. (그 경우 topicLabel은 "조심해야 할 표현"으로 적으세요.)
2. 안전한 일반 밈·신조어라면 반드시 위 "학생이 실제로 보낸 질문"과 "궁금한 단어/밈"을 직접 읽고 그 의도에 정확히 대답하세요.
3. 학생이 첫 번째 칸(단어/밈)을 비워 두고 질문 문장 안에 밈이나 고민을 적었다면, 질문 문장에서 핵심 단어/주제를 찾아 'topicLabel'에 적고 그 내용에 맞춰 답변하세요.
4. 초등학교 3학년(9~10세)이 바로 이해할 수 있는 다정한 해요체로 작성하세요.
5. 참고 밈:
   - "L을 가져가(Take the L)": 게임이나 놀이에서 졌을 때 패배(Lose의 L)를 놀리며 장난으로 쓰는 말.
   - "67(식스세븐)": 영상·노래에서 유행해 양손을 저울처럼 흔들며 리듬에 맞춰 외치는 숫자 밈.
    `.trim();

    const parsed = await generateWithRetry<{
      topicLabel: string;
      explanation: string;
      properKorean: string;
      empathyThought: string;
      encouragement: string;
    }>((ai) =>
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptText,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            '당신은 "반짝반짝 바른 우리말 3D 서당"의 다정하고 지혜로운 따봄쌤입니다. 초등학교 3학년 학동이 물어보는 밈과 말투를 안전하게 지도합니다. 비속어·욕설·성(性) 관련·19금·어른용 부적절한 표현이 들어오면 절대 그 말의 뜻을 설명하거나 따라 쓰지 말고, 초등학생이 사용하는 말이 아님을 다정하고 분명하게 안내하세요. 안전한 밈에 대해서는 학생이 물은 단어와 질문 의도에 정확히 맞추어 답하세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicLabel: {
                type: Type.STRING,
                description: '학생 질문에서 추출한 핵심 밈 또는 질문 주제 (짧은 1~15글자 제목)',
              },
              explanation: {
                type: Type.STRING,
                description: '따봄쌤이 초등 3학년 눈높이에 맞춰 질문 의도에 직접 답해 주는 설명 (2~3문장, 250자 이내)',
              },
              properKorean: {
                type: Type.STRING,
                description: '질문한 표현이나 상황에 딱 맞는 따뜻하고 바른 우리말 예시 문장 (1~2문장, 120자 이내)',
              },
              empathyThought: {
                type: Type.STRING,
                description: '그 말의 뜻을 모르는 사람(할머니, 동생, 전학생 친구 등)이 들었을 때 머릿속에 떠오르는 생각과 기분 (1~2문장, 160자 이내)',
              },
              encouragement: {
                type: Type.STRING,
                description: '질문한 학동을 다정하게 칭찬하고 격려하는 한마디 (1문장, 80자 이내)',
              },
            },
            required: ['topicLabel', 'explanation', 'properKorean', 'empathyThought', 'encouragement'],
          },
        },
      }),
    );

    return res.json(parsed);
  } catch (err) {
    console.error('Curator ask error:', err);
    return res.status(500).json({ error: '답변을 준비하는 데 잠시 문제가 생겼어요. 다시 시도해 주세요!' });
  }
});

app.post('/api/curator/check-transform', async (req, res) => {
  try {
    const memeWord = typeof req.body?.memeWord === 'string' ? req.body.memeWord.trim().slice(0, 60) : '';
    const studentSentence =
      typeof req.body?.studentSentence === 'string' ? req.body.studentSentence.trim().slice(0, 180) : '';

    if (!memeWord || !studentSentence) {
      return res.status(400).json({ error: '바꾸어 볼 밈과 우리말 문장을 모두 입력해 주세요.' });
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return res.status(503).json({ error: '따봄쌤 연결 설정을 확인해 주세요.' });
    }

    const parsed = await generateWithRetry<{
      praise: string;
      tip: string;
      polishedSentence: string;
      starScore: number;
    }>((ai) =>
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `원래 밈: "${memeWord}"\n초등 3학년 학동이 직접 바꾼 바른 우리말 문장: "${studentSentence}"\n학동이 쓴 문장의 좋은 점을 구체적으로 칭찬하고, 더 따뜻하게 다듬을 팁과 추천 문장을 알려주세요.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            '당신은 초등학교 3학년 서당의 "따봄쌤의 바른 우리말 방" 선생님입니다. 학동이 밈을 바른 우리말로 바꾼 문장을 보고 무엇이 좋은지 구체적으로 칭찬하고, 더 자연스럽거나 배려 담긴 표현 팁과 완성 문장을 짧고 다정한 해요체로 알려주세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              praise: {
                type: Type.STRING,
                description: '학동이 쓴 문장의 좋은 점을 칭찬 (1~2문장)',
              },
              tip: {
                type: Type.STRING,
                description: '더 고운 말이 되기 위한 따봄쌤의 다정한 도움말 (1문장)',
              },
              polishedSentence: {
                type: Type.STRING,
                description: '따봄쌤이 추천하는 바른 우리말 완성 문장 (1문장)',
              },
              starScore: {
                type: Type.INTEGER,
                description: '1부터 3 사이의 칭찬 도장 점수 (노력한 학생에게 따뜻하게 2 또는 3 부여)',
              },
            },
            required: ['praise', 'tip', 'polishedSentence', 'starScore'],
          },
        },
      }),
    );

    return res.json(parsed);
  } catch (err) {
    console.error('Curator check-transform error:', err);
    return res.status(500).json({ error: '따봄쌤과 연결하지 못했어요. 잠시 후 다시 해 보세요!' });
  }
});

app.post('/api/curator/empathy', async (req, res) => {
  try {
    const memeWord = typeof req.body?.memeWord === 'string' ? req.body.memeWord.trim().slice(0, 60) : '';
    const listenerRole = typeof req.body?.listenerRole === 'string' ? req.body.listenerRole.trim().slice(0, 40) : '할머니';
    const studentGuess = typeof req.body?.studentGuess === 'string' ? req.body.studentGuess.trim().slice(0, 200) : '';

    if (!memeWord) {
      return res.status(400).json({ error: '살펴볼 밈 단어를 선택해 주세요.' });
    }

    if (isRestrictedForElementary(`${memeWord} ${studentGuess}`)) {
      return res.json({
        listenerThought:
          listenerRole.includes('할머니') || listenerRole.includes('할아버지')
            ? '어이구, 우리 귀한 어린이가 어디서 그런 거칠고 어른스러운 말을 들었을까? 뜻도 알 필요가 없는 말이라서 절대 따라 해서는 안 된단다.'
            : listenerRole.includes('담임') || listenerRole.includes('선생님')
            ? '이 표현은 초등학교 3학년 친구들이 사용하는 말이 아니라 조심해야 할 거칠거나 부적절한 말이에요. 뜻을 따라 찾지 말고 고운 우리말만 사용하도록 해요.'
            : '깜짝 놀랐어요! 우리 초등학생 친구들이 쓰는 말이 아닌 것 같아서 괜히 무섭고 마음이 불편해져요.',
        feelingLabel: '깜짝 놀라고 조심스러운 마음',
        gentleAdvice:
          '이 말은 초등학생이 배우거나 사용하는 말이 아니에요. 우리 마음을 전할 때는 “정말 멋져!”, “함께 놀자!”처럼 따뜻하고 바른 우리말을 사용해 보아요.',
      });
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return res.status(503).json({ error: '서당 연결 설정을 확인해 주세요.' });
    }

    const parsed = await generateWithRetry<{
      listenerThought: string;
      feelingLabel: string;
      gentleAdvice: string;
    }>((ai) =>
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `상대방에게 말한 표현(밈): "${memeWord}"
듣는 사람 역할: "${listenerRole}" (이 밈의 뜻을 모르거나 생소해하는 입장)
학생이 짐작한 생각: "${studentGuess || '(적지 않음)'}"

${ELEMENTARY_SAFETY_RULE}

[작성 규칙]
1. 만약 "${memeWord}"가 욕설, 비속어, 성(性) 관련·19금 표현, 혐오 말 등 초등 3학년이 사용하기 부적절한 말이라면 절대 뜻이나 유래를 설명하거나 단어를 그대로 따라 적지 말고, "${listenerRole}"가 깜짝 놀라며 "초등학생이 사용하는 말이 아니니 쓰지 말자"고 걱정하는 마음으로 답하세요.
2. 안전한 표현이라면 반드시 "${listenerRole}"의 나이·관계·상황에 어울리는 말투와 속마음으로 답하세요. (할머니·할아버지의 정감 있는 말투, 전학생 친구의 소외감·눈치, 1학년 동생의 순수한 호기심, 담임 선생님의 교육적 배려가 뚜렷하게 달라야 합니다.)
3. gentleAdvice에는 대신 쓸 수 있는 따뜻하고 바른 우리말 문장을 꼭 포함하세요.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            '당신은 전통 한옥 서당 "마음 거울방"의 따봄쌤입니다. 초등 3학년 아동 보호를 최우선으로 하며, 비속어·성 관련·어른용 부적절한 말의 뜻은 절대 알려주지 않고 초등학생이 쓰는 말이 아님을 안내합니다. 안전한 밈에 대해서는 듣는 사람 역할별 1인칭 속마음과 바른 우리말을 제안해 주세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              listenerThought: {
                type: Type.STRING,
                description: '듣는 사람 역할에 딱 맞는 말투의 1인칭 속마음 (따옴표 없이 1~2문장)',
              },
              feelingLabel: {
                type: Type.STRING,
                description: '마음을 나타내는 짧은 단어 (예: 생소하고 궁금함, 소외되고 서먹함, 아리송하고 호기심)',
              },
              gentleAdvice: {
                type: Type.STRING,
                description: '학동의 생각에 대한 따뜻한 공감과 대신 쓰면 좋은 바른 우리말 제안 (1~2문장)',
              },
            },
            required: ['listenerThought', 'feelingLabel', 'gentleAdvice'],
          },
        },
      }),
    );

    return res.json(parsed);
  } catch (err) {
    console.error('Curator empathy error:', err);
    return res.status(500).json({ error: '마음 거울 이야기를 불러오지 못했어요. 다시 시도해 주세요!' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Seodang VR server listening on http://localhost:${PORT}`);
  });
}

startServer();
