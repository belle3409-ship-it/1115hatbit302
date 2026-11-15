export type MuseumZoneId = 'atrium' | 'meme_meaning' | 'proper_korean' | 'empathy_mirror' | 'lounge';

export type AvatarColorId = 'sky' | 'emerald' | 'amber' | 'coral';

export interface MemeExhibit {
  id: string;
  memeWord: string;
  category: string;
  meaning: string;
  origin: string;
  exampleSituation: string;
  properKorean: string;
  properExplanation: string;
  empathyListeners: {
    role: string;
    thought: string;
    feeling: string;
  }[];
  quiz: {
    question: string;
    choices: string[];
    correctIndex: number;
    feedback: string;
  };
}

export interface ZoneMeta {
  id: MuseumZoneId;
  shortName: string;
  title: string;
  subtitle: string;
  accentHex: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export const MUSEUM_ZONES: ZoneMeta[] = [
  {
    id: 'atrium',
    shortName: '대청마루',
    title: '서당 대청마루 · 한글 글방 안내',
    subtitle: '3D 학동 캐릭터를 움직여 따봄쌤의 밈 방과 바른 우리말 방을 탐험해요',
    accentHex: '#B45309',
    position: [0, 0, 5.5],
    lookAt: [0, 1.4, -2],
  },
  {
    id: 'meme_meaning',
    shortName: '1방 요즘 밈',
    title: '1방 · 따봄쌤의 요즘 밈 방',
    subtitle: 'L을 가져가, 67 등 요즘 유행하는 밈이 무슨 뜻인지 따봄쌤이 쉽게 설명해 줘요',
    accentHex: '#0284C7',
    position: [-9.5, 0, 0],
    lookAt: [-13.5, 1.8, 0],
  },
  {
    id: 'proper_korean',
    shortName: '2방 바른말',
    title: '2방 · 따봄쌤의 바른 우리말 방',
    subtitle: '따봄쌤과 함께 요즘 유행하는 밈을 곱고 따뜻한 바른 우리말로 바꾸어 보아요',
    accentHex: '#059669',
    position: [9.5, 0, 0],
    lookAt: [13.5, 1.8, 0],
  },
  {
    id: 'empathy_mirror',
    shortName: '3방 마음거울',
    title: '3방 · 마음 거울방 (듣는 사람의 마음)',
    subtitle: '밈의 뜻을 모르는 사람이 들었을 때 어떤 생각이 들지 함께 느껴 봐요',
    accentHex: '#E11D48',
    position: [0, 0, -9.5],
    lookAt: [0, 1.8, -13.5],
  },
  {
    id: 'lounge',
    shortName: '따봄쌤방',
    title: '따봄쌤의 질문·답변·듣기방',
    subtitle: '궁금한 밈이나 바른 우리말을 따봄쌤께 질문하고, 설명을 들으며 배움첩에 기록해요',
    accentHex: '#7C3AED',
    position: [0, 0, 0.5],
    lookAt: [0, 1.5, -4],
  },
];

export const MEME_EXHIBITS: MemeExhibit[] = [
  {
    id: 'take_the_l',
    memeWord: 'L을 가져가',
    category: '게임·영상 유행 밈',
    meaning: '영어 ‘Lose(패배)’의 첫 글자 L을 따서 “네가 졌으니 패배(L)를 받아들여!”라는 뜻으로 장난치며 쓰는 말이에요.',
    origin: '로블록스 같은 게임이나 짧은 영상에서 상대가 실수하거나 졌을 때 손가락으로 L 모양을 만들며 “Take the L(L을 가져가)”라고 놀리던 것에서 유행했어요.',
    exampleSituation: '피구 경기나 보드게임에서 진 친구에게 “에이, L을 가져가!”라고 말하며 웃는 경우',
    properKorean: '아쉽지만 이번엔 내가 이겼네! 다음 판에는 우리 같이 더 멋지게 해 보자.',
    properExplanation: '진 친구에게 패배를 놀리는 말 대신 다정하게 격려하는 바른 우리말을 쓰면 모두가 즐겁게 놀 수 있어요.',
    empathyListeners: [
      {
        role: '할머니',
        thought: 'L을 가져가라니, 알파벳 L 모양 물건을 가져가라는 뜻인가? 우리 손주가 갑자기 무슨 영어 이야기를 하는지 궁금하구나.',
        feeling: '뜻을 몰라 어리둥절함',
      },
      {
        role: '경기에서 진 친구',
        thought: '안 그래도 져서 마음이 속상한데 ‘L(패배)을 가져가’라고 놀리니까 더 억울하고 기분이 상하네.',
        feeling: '놀림받는 기분이 들어 속상함',
      },
    ],
    quiz: {
      question: '친구와 보드게임이나 피구를 하고 내가 이겼을 때 “L을 가져가!” 대신 쓰기 가장 좋은 바른 우리말은?',
      choices: [
        '다음에는 네가 이길 수도 있어! 같이 하니까 정말 재미있었다.',
        '두 손으로 더 크게 L 모양을 만들어 보여 준다.',
        '너는 원래 못하니까 L 두 개를 가져가라고 말한다.',
      ],
      correctIndex: 0,
      feedback: '정답이에요! 이긴 기쁨만 뽐내지 않고 진 친구의 마음까지 배려하는 멋진 3학년의 우리말이에요.',
    },
  },
  {
    id: 'six_seven',
    memeWord: '67 (식스세븐)',
    category: '요즘 초등 유행 밈',
    meaning: '영어 숫자 ‘식스 세븐(Six-Seven)’을 리듬에 맞춰 외치면서 두 손을 저울처럼 위아래로 흔들어 장난스럽게 분위기를 띄우는 유행 밈이에요.',
    origin: '해외 노래 가사와 농구 영상이 짧은 동영상(쇼츠·릴스)에서 큰 인기를 끌면서, 일상에서 6이나 7이라는 숫자만 보이면 친구들끼리 따라 외치며 유행하게 되었어요.',
    exampleSituation: '수학 시간에 “67쪽을 펴 보세요”라는 말에 친구들이 다 같이 “식스 세븐!” 하고 외치며 웃는 경우',
    properKorean: '우와, 67쪽이 나왔네요! 우리 이제 수업에 집중해서 문제를 같이 풀어 봐요.',
    properExplanation: '친구들끼리 웃고 넘기는 유행어라도 수업 시간이나 뜻을 모르는 사람 앞에서는 바르고 또박또박한 우리말로 말해요.',
    empathyListeners: [
      {
        role: '할아버지',
        thought: '갑자기 큰 소리로 식스 세븐이라고 외치니 무슨 외국어 비밀번호라도 말하는 건가 싶어 깜짝 놀랐구나.',
        feeling: '영문을 몰라 당황스러움',
      },
      {
        role: '새로 온 전학생 친구',
        thought: '숫자 67이 왜 그렇게 재미있고 웃긴 걸까? 나만 뜻을 몰라서 친구들이 웃을 때 혼자 가만히 있게 되네.',
        feeling: '혼자만 모르는 것 같아 소외감',
      },
    ],
    quiz: {
      question: '수업 시간에 숫자 67이 나왔을 때 “식스 세븐!”을 크게 외치며 장난치는 대신 어떤 말과 행동이 좋을까요?',
      choices: [
        '수업이 끝날 때까지 계속 67만 크게 외친다.',
        '마음속으로만 반가워하고, “선생님, 67쪽 다 찾았어요!”라고 바르게 말한다.',
        '왜 67을 모르냐고 다른 친구를 놀린다.',
      ],
      correctIndex: 1,
      feedback: '참 잘했어요! 때와 장소를 구별하고 바른 우리말로 대답하는 모습이 정말 멋져요.',
    },
  },
  {
    id: 'eojjeoltv',
    memeWord: '어쩔티비',
    category: '장난스러운 대답 밈',
    meaning: '“어쩌라고, 가서 텔레비전이나 봐!”라는 뜻을 장난스럽게 줄여서 만든 말이에요.',
    origin: '상대방의 말을 듣기 싫거나 장난으로 이기려고 할 때 재미 삼아 쓰기 시작했어요.',
    exampleSituation: '친구가 “우리 이제 숙제 먼저 하자”라고 했을 때 장난으로 “어쩔티비!”라고 답하는 경우',
    properKorean: '지금은 내가 하고 싶은 게 있어서 조금만 있다가 이야기하자.',
    properExplanation: '내가 지금 어떤 마음인지, 왜 그런지 솔직하고 예의 있게 말하면 친구와 다투지 않아요.',
    empathyListeners: [
      {
        role: '할머니',
        thought: '어쩌라고 TV를 보라니? 내가 말 거는 게 싫어서 텔레비전이나 보라고 하는 건가 싶어 마음이 서운하구나.',
        feeling: '서운함과 당황스러움',
      },
      {
        role: '새로 온 전학생 친구',
        thought: '갑자기 텔레비전 이야기를 왜 하지? 내가 무슨 실수를 해서 나랑 말하기 싫다는 뜻인가?',
        feeling: '어리둥절하고 소외된 기분',
      },
    ],
    quiz: {
      question: '친구가 말을 걸었을 때 “어쩔티비” 대신 쓰기 가장 좋은 바른 우리말은 무엇일까요?',
      choices: [
        '저쩔냉장고라고 더 크게 말한다.',
        '지금은 조금 바빠서 쉬는 시간에 다시 이야기하자고 말한다.',
        '아무 대답도 하지 않고 그냥 가 버린다.',
      ],
      correctIndex: 1,
      feedback: '정확해요! 상대방의 기분을 상하게 하지 않으면서 내 생각을 차분하게 전하는 멋진 말이에요.',
    },
  },
  {
    id: 'kingbatne',
    memeWord: '킹받네',
    category: '감정 표현 밈',
    meaning: '‘왕(King)’처럼 아주 크게 ‘열받는다(화가 난다)’라는 뜻을 합쳐서 만든 말이에요.',
    origin: '화가 나거나 약이 오를 때 감정을 과장해서 재미있게 표현하려고 많이 쓰여요.',
    exampleSituation: '공들여 쌓은 블록이 실수로 무너졌을 때 “아, 진짜 킹받네!”라고 외치는 경우',
    properKorean: '열심히 만들었는데 무너져서 정말 속상하고 아쉽다.',
    properExplanation: '거친 표현 대신 ‘속상하다’, ‘아쉽다’, ‘화가 조금 났다’처럼 내 감정을 정확히 말해요.',
    empathyListeners: [
      {
        role: '1학년 동생',
        thought: '‘킹’은 왕이라는 뜻인데 왕을 받는다는 건가? 언니 오빠가 화가 난 것 같아 무서워.',
        feeling: '뜻을 몰라 긴장되고 무서운 기분',
      },
      {
        role: '담임 선생님',
        thought: '무슨 일 때문에 마음이 상했는지 바로 알기 어렵구나. 차분하게 이유를 말해 주면 도와줄 수 있을 텐데.',
        feeling: '상황을 알기 어려워 걱정됨',
      },
    ],
    quiz: {
      question: '짝꿍이 실수로 내 지우개를 떨어뜨렸을 때 “킹받네” 대신 어떤 말을 하면 좋을까요?',
      choices: [
        '조금 놀랐지만 괜찮아. 다음엔 조심히 놓아주자!',
        '왕받네라고 말을 바꾸어 부른다.',
        '큰 소리로 화를 낸다.',
      ],
      correctIndex: 0,
      feedback: '참 잘했어요! 내 마음을 부드럽게 전하면 친구도 미안해하며 더 조심하게 돼요.',
    },
  },
  {
    id: 'eokgga',
    memeWord: '억까',
    category: '줄임말 밈',
    meaning: '‘억지로 까내린다(비난한다)’를 줄여서, 이유 없이 억울하게 나를 탓할 때 쓰는 말이에요.',
    origin: '게임이나 이야기 속에서 말도 안 되게 불리한 상황이 생겼을 때 쓰던 말에서 퍼졌어요.',
    exampleSituation: '모둠 활동에서 내 의견이 채택되지 않았을 때 “이건 완전 억까야!”라고 말하는 경우',
    properKorean: '내 생각과는 조금 달라서 아쉽고 억울한 마음이 들어. 내 이야기도 들어줄래?',
    properExplanation: '‘까내린다’라는 거친 말 대신 ‘아쉽다’, ‘억울하다’라는 고운 표현으로 말해요.',
    empathyListeners: [
      {
        role: '할아버지',
        thought: '억까가 무슨 소리니? 까마귀 소리 같기도 하고, 혹시 나쁜 말은 아닌지 걱정이 되는구나.',
        feeling: '낯설고 걱정되는 마음',
      },
      {
        role: '친한 친구',
        thought: '내가 나쁜 의도로 그런 게 아닌데 ‘억지로 깐다’고 하니까 나도 기분이 조금 상하네.',
        feeling: '오해받는 것 같아 속상함',
      },
    ],
    quiz: {
      question: '놀이 규칙이 나에게 불리하다고 느껴질 때 “억까야!” 대신 바르게 말하면?',
      choices: [
        '이 규칙은 내가 조금 불리한 것 같아. 다시 정해보면 어떨까?',
        '무조건 내 마음대로 하겠다고 떼를 쓴다.',
        '그냥 억까라고 세 번 말한다.',
      ],
      correctIndex: 0,
      feedback: '멋져요! 이유를 또박또박 설명하면 친구들도 귀 기울여 들어 줄 거예요.',
    },
  },
  {
    id: 'jeommechu',
    memeWord: '점메추',
    category: '줄임말 밈',
    meaning: '‘점심 메뉴 추천’이라는 다섯 글자를 세 글자로 줄여서 부르는 말이에요.',
    origin: '채팅이나 짧은 글에서 빠르게 물어보려고 앞 글자만 따서 쓰기 시작했어요.',
    exampleSituation: '주말에 가족에게 “오늘 점메추 해주세요!”라고 말할 때',
    properKorean: '오늘 점심에 어떤 맛있는 음식을 먹으면 좋을지 추천해 주세요!',
    properExplanation: '글자를 너무 많이 줄이면 처음 듣는 사람은 암호처럼 느껴질 수 있어요. 풀어서 말하면 누구나 알아들어요.',
    empathyListeners: [
      {
        role: '할아버지',
        thought: '점메추? 메추리알을 점심에 먹자는 뜻인가? 무슨 음식 이름인지 한참 생각했네.',
        feeling: '암호처럼 느껴져 어리둥절함',
      },
      {
        role: '외국인 친구',
        thought: '한국어 사전에서 찾아보아도 나오지 않는 단어라 무슨 뜻인지 전혀 모르겠어.',
        feeling: '대화에 끼기 어려워 막막함',
      },
    ],
    quiz: {
      question: '할머니께 점심 음식을 여쭤볼 때 가장 알맞은 표현은 무엇일까요?',
      choices: [
        '할머니, 오늘 점메추 주세요!',
        '할머니, 오늘 점심으로 어떤 음식을 드시고 싶으세요?',
        '할머니, 점심은 알아서 할게요.',
      ],
      correctIndex: 1,
      feedback: '정답이에요! 풀어서 공손하게 여쭤보니 할머니께서도 환하게 웃으실 거예요.',
    },
  },
];

export const AVATAR_COLORS: Record<AvatarColorId, { label: string; hex: string; accent: string }> = {
  sky: { label: '하늘 배자', hex: '#0284C7', accent: '#BAE6FD' },
  emerald: { label: '초록 배자', hex: '#059669', accent: '#A7F3D0' },
  amber: { label: '노랑 배자', hex: '#D97706', accent: '#FDE68A' },
  coral: { label: '분홍 배자', hex: '#E11D48', accent: '#FECDD3' },
};
