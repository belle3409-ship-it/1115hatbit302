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

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return res.status(503).json({ error: '따봄쌤 연결 설정을 확인해 주세요.' });
    }

    const promptText = `
[학생 입력 정보]
- 현재 학습 방: ${zone}
- 학생이 적은 궁금한 단어/밈(비어 있을 수 있음): "${memeWord || '(적지 않음)'}"
- 학생이 실제로 보낸 질문: "${question || `${memeWord}의 뜻과 바른 우리말, 듣는 사람의 마음이 궁금해요!`}"

[답변 작성 규칙]
1. 반드시 위 "학생이 실제로 보낸 질문"과 "궁금한 단어/밈"을 직접 읽고 그 의도에 정확히 대답하세요. 다른 예시 단어로 임의로 바꾸지 마세요.
2. 학생이 첫 번째 칸(단어/밈)을 비워 두고 질문 문장 안에 밈이나 고민을 적었다면, 질문 문장에서 핵심 단어/주제를 찾아 'topicLabel'에 적고 그 내용에 맞춰 답변하세요.
3. 초등학교 3학년(9~10세)이 바로 이해할 수 있는 다정한 해요체로 작성하세요.
4. 최근 유행 밈 참고:
   - "L을 가져가(Take the L)": 게임이나 놀이에서 졌을 때 패배(Lose의 L)를 놀리며 장난으로 쓰는 말.
   - "67(식스세븐)": 영상·노래에서 유행해 양손을 저울처럼 흔들며 리듬에 맞춰 외치는 숫자 밈.
   - 그 외 어떤 유행어·신조어·학교생활 말투 질문이 와도 뜻을 쉽고 안전하게 풀어 주고(비속어는 직접 따라 쓰지 않고 순화), 대신 쓸 바른 우리말 문장과 모르는 사람(할머니·전학생 친구 등)의 마음을 따뜻하게 설명하세요.
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
            '당신은 "반짝반짝 바른 우리말 3D 서당"의 다정하고 지혜로운 따봄쌤입니다. 초등학교 3학년 학동이 물어보는 모든 밈, 유행어, 말투, 소통 고민에 대해 질문 의도를 정확히 짚어 쉽고 안전하게 설명해 줍니다. 절대 예시 단어로 딴소리를 하지 말고, 학생이 실제로 물은 말과 질문에 초점을 맞추어 답변하세요.',
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
        contents: `밈 표현: "${memeWord}"\n듣는 사람: "${listenerRole}" (이 밈의 뜻을 전혀 모름)\n학동이 짐작한 생각: "${studentGuess || '어떤 마음이 들지 궁금해요!'}"\n"${listenerRole}"의 입장에서 속마음을 들려주고, 학동의 생각에 다정하게 공감하며 대신 쓸 고운 말을 제안해 주세요.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            '당신은 전통 한옥 서당 "마음 거울방"의 따봄쌤입니다. 밈의 뜻을 모르는 사람(할머니, 할아버지, 전학 온 친구, 1학년 동생, 담임 선생님 등)이 그 밈을 처음 들었을 때 머릿속으로 어떤 생각을 하고 기분이 어떨지 생생한 1인칭 속마음으로 들려주고, 초등 3학년 학동의 생각에 따뜻하게 공감해 주세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              listenerThought: {
                type: Type.STRING,
                description: '듣는 사람이 속으로 할 법한 실제 생각 (따옴표 없이 1~2문장)',
              },
              feelingLabel: {
                type: Type.STRING,
                description: '마음을 나타내는 짧은 단어 (예: 어리둥절함, 서운함, 낯설고 벽이 느껴짐)',
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
