import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: '서당 선생님 연결 설정을 확인해 주세요.' });
    }

    const promptText = `
학동(초등 3학년 학생)이 서당 글방(${zone})에서 질문을 올렸습니다.
궁금한 말/밈: "${memeWord || '직접 질문'}"
학생의 질문: "${question || `${memeWord}의 뜻과 바른 우리말이 궁금해요!`}"

초등학교 3학년 학생(9~10세)이 읽고 듣기 좋도록:
- 요즘 유행을 잘 아는 다정하고 친절한 "따봄쌤"처럼 밈의 뜻과 유래를 쉽게 풀어 주고,
- 따뜻하고 바른 우리말 표현과 듣는 사람의 마음까지 알기 쉬운 해요체로 설명해 주세요.
(참고: "L을 가져가"는 영어 Take the L에서 온 게임·놀이 패배 밈이고, "67" 또는 "식스세븐"은 최근 유행 영상에서 나와 양손을 저울처럼 흔들며 외치는 숫자 유행 밈입니다.)
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: promptText,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          '당신은 "반짝반짝 바른 우리말 3D 서당"의 다정하고 친절한 따봄쌤입니다. 초등학교 3학년 학동들에게 요즘 유행하는 밈("L을 가져가", "67(식스세븐)", "어쩔티비", "킹받네" 등)의 뜻을 쉽고 안전하게 풀어 주고, 예쁘고 바른 우리말 표현으로 바꾸는 방법과, 그 밈을 모르는 사람(할머니, 할아버지, 전학생 친구 등)이 들었을 때 어떤 생각과 기분이 들지를 다정하게 일러 줍니다. 비속어나 폭력적인 표현은 절대 따라 쓰지 않고 순화하여 설명하세요.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: '따봄쌤이 초등 3학년 눈높이에 맞춰 들려주는 밈의 뜻과 유래 설명 (2~3문장, 250자 이내)',
            },
            properKorean: {
              type: Type.STRING,
              description: '따봄쌤이 추천하는 따뜻하고 바른 우리말 예시 문장 (1~2문장, 120자 이내)',
            },
            empathyThought: {
              type: Type.STRING,
              description: '밈의 뜻을 모르는 사람이 들었을 때 머릿속에 떠오르는 생각과 마음 (2문장, 160자 이내)',
            },
            encouragement: {
              type: Type.STRING,
              description: '질문한 학동을 칭찬하는 따뜻한 한마디 (1문장, 80자 이내)',
            },
          },
          required: ['explanation', 'properKorean', 'empathyThought', 'encouragement'],
        },
      },
    });

    const raw = (response.text || '{}').trim();
    const parsed = JSON.parse(raw);
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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: '따봄쌤 연결 설정을 확인해 주세요.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `원래 밈: "${memeWord}"\n초등 3학년 학동이 바꾼 바른 우리말 문장: "${studentSentence}"\n따봄쌤으로서 학동의 문장을 따뜻하게 격려하고 다듬어 주세요.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          '당신은 초등학교 3학년 서당의 "따봄쌤의 바른 우리말 방" 선생님입니다. 학동이 밈을 바른 우리말로 바꾼 문장을 보고 구체적으로 무엇이 좋은지 칭찬하고, 더 자연스럽거나 배려 담긴 표현 팁과 완성 문장을 짧고 다정한 해요체로 알려주세요.',
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
    });

    const parsed = JSON.parse((response.text || '{}').trim());
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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: '서당 연결 설정을 확인해 주세요.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `밈 표현: "${memeWord}"\n듣는 사람: "${listenerRole}" (이 밈의 뜻을 전혀 모름)\n학동의 생각: "${studentGuess || '어떤 마음이 들지 궁금해요!'}"`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          '당신은 전통 한옥 서당 "마음 거울방"의 안내자입니다. 밈의 뜻을 모르는 사람(예: 할머니, 전학 온 친구, 동생, 선생님)이 그 밈을 처음 들었을 때 머릿속으로 어떤 생각을 하고 기분이 어떨지 1인칭 또는 다정한 설명으로 들려주고, 초등 3학년 학동의 생각에 공감해 주세요.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            listenerThought: {
              type: Type.STRING,
              description: '듣는 사람이 속으로 할 법한 실제 생각 (따옴표 없이 2문장)',
            },
            feelingLabel: {
              type: Type.STRING,
              description: '마음을 나타내는 짧은 단어 (예: 어리둥절함, 서운함, 낯설고 벽이 느껴짐)',
            },
            gentleAdvice: {
              type: Type.STRING,
              description: '학동의 생각에 대한 따뜻한 공감과 대안 표현 (1~2문장)',
            },
          },
          required: ['listenerThought', 'feelingLabel', 'gentleAdvice'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
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
