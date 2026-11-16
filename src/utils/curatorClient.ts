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

type MemeVibe = 'teasing' | 'excited' | 'acronym' | 'english' | 'rough';
type RoleKey = 'grandma' | 'grandpa' | 'transfer' | 'younger' | 'teacher';

interface KnownMemeInfo {
  keywords: string[];
  label: string;
  vibe: MemeVibe;
  explanation: string;
  properKorean: string;
  empathyThought: string;
  roleThoughts?: Partial<Record<RoleKey, { thought: string; feeling: string }>>;
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
    vibe: (
      m.id === 'take_the_l' || m.id === 'eojjeoltv'
        ? 'teasing'
        : m.id === 'six_seven'
        ? 'excited'
        : m.id === 'kingbatne' || m.id === 'eokgga'
        ? 'rough'
        : 'acronym'
    ) as MemeVibe,
    explanation: `${m.meaning} ${m.origin}`,
    properKorean: m.properKorean,
    empathyThought: `${m.empathyListeners[0]?.role || '듣는 사람'}은(는) “${m.empathyListeners[0]?.thought || '무슨 뜻인지 몰라 당황스러워요.'}”라고 생각할 수 있어요.`,
    roleThoughts:
      m.id === 'take_the_l'
        ? {
            grandma: {
              thought: 'L을 가져가라니, 영어 알파벳 L 모양 물건을 가져가라는 뜻인가? 우리 손주가 갑자기 무슨 외국 말을 하는지 궁금하구나.',
              feeling: '뜻을 몰라 어리둥절함',
            },
            grandpa: {
              thought: '허허, L을 가져가라니 할아버지는 영어를 잘 몰라서 무슨 선물이라도 주겠다는 건가 싶네. 쉬운 우리말로 말해 주겠니?',
              feeling: '낯설지만 궁금한 마음',
            },
            transfer: {
              thought: '내가 게임에서 졌는데 ‘L을 가져가’라고 하니까 나를 따돌리거나 놀리는 것 같아서 기분이 확 상하고 서러워져.',
              feeling: '놀림받는 기분이 들어 속상함',
            },
            younger: {
              thought: 'L이 뭐예요? 좋은 걸 주는 건줄 알았는데 친구들이 웃으니까 나만 바보가 된 것 같아 조금 울적해요.',
              feeling: '주눅 들고 서운한 기분',
            },
            teacher: {
              thought: '놀이에서 이겨 신난 건 알지만, 패배를 뜻하는 말로 친구를 놀리면 즐겁던 놀이가 다툼으로 번질 수 있어 걱정이 되네요.',
              feeling: '친구 마음이 다칠까 걱정됨',
            },
          }
        : m.id === 'six_seven'
        ? {
            grandma: {
              thought: '식스 세븐이라니 갑자기 영어 숫자를 리듬 타며 외치니까 무슨 노래를 부르는 건가 싶어 깜짝 놀랐구나.',
              feeling: '영문을 몰라 깜짝 놀람',
            },
            grandpa: {
              thought: '갑자기 두 손을 흔들며 식스 세븐이라고 외치니 무슨 외국어 비밀번호라도 말하는 건가 싶어 당황스럽구나.',
              feeling: '영문을 몰라 당황스러움',
            },
            transfer: {
              thought: '숫자 67이 나올 때마다 다들 두 손을 흔들며 웃는데, 나만 왜 웃긴지 몰라서 혼자 가만히 서 있게 되네.',
              feeling: '혼자만 모르는 것 같아 소외감',
            },
            younger: {
              thought: '우와, 언니 오빠들이 67만 나오면 손을 흔들면서 소리치는데 무슨 로봇 춤인가요? 나도 무슨 뜻인지 알고 싶어요!',
              feeling: '신기하지만 어리둥절함',
            },
            teacher: {
              thought: '유행하는 리듬 밈이 재미있긴 하지만, 수업 시간이나 숫자 이야기가 나올 때마다 반복하면 집중이 흐트러져 다른 친구들이 힘들 수 있어요.',
              feeling: '수업 분위기가 흐트러질까 걱정됨',
            },
          }
        : m.id === 'eojjeoltv'
        ? {
            grandma: {
              thought: '어쩌라고 TV를 보라니? 할머니가 말 거는 게 싫어서 텔레비전이나 보라고 하는 건가 싶어 마음이 서운하구나.',
              feeling: '서운함과 당황스러움',
            },
            grandpa: {
              thought: '어쩔티비가 무슨 말인지 몰라도 ‘어쩌라고’ 하는 투로 들리니 할아버지 이야기를 듣기 싫은가 싶어 서운하네.',
              feeling: '대화가 끊긴 것 같아 서운함',
            },
            transfer: {
              thought: '갑자기 텔레비전 이야기를 왜 하지? 내가 무슨 실수를 해서 나랑 말하기 싫다는 뜻인가?',
              feeling: '어리둥절하고 소외된 기분',
            },
            younger: {
              thought: '티비 보라는 말인가요? 내가 말을 걸었는데 휙 돌아서면 나랑 놀기 싫은 것 같아 눈물이 날 것 같아요.',
              feeling: '거절당한 것 같아 속상함',
            },
            teacher: {
              thought: '장난으로 던진 말이라도 상대방의 이야기를 막아 버리는 느낌을 주니까 대화를 이어 가기가 참 어려워 보여요.',
              feeling: '대화가 막혀 안타까움',
            },
          }
        : m.id === 'kingbatne'
        ? {
            grandma: {
              thought: '킹이 왕이라던데 왕한테 무엇을 받는다는 소리니? 화가 난 얼굴을 보니 무슨 안 좋은 일이 생겼을까 걱정되는구나.',
              feeling: '무슨 일인지 몰라 걱정됨',
            },
            grandpa: {
              thought: '‘받네’라고 거칠게 말하니 할아버지는 무슨 나쁜 욕설은 아닌지 깜짝 놀랐구나. 속상한 일을 차분히 말해 보렴.',
              feeling: '거친 말투에 깜짝 놀람',
            },
            transfer: {
              thought: '갑자기 ‘킹받네’라고 크게 말하니까 혹시 나 때문에 화가 난 건가 싶어서 눈치를 보게 돼.',
              feeling: '내 탓인가 싶어 긴장됨',
            },
            younger: {
              thought: '‘킹’은 왕이라는 뜻인데 왕을 받는다는 건가? 언니 오빠가 화가 난 것 같아 무서워.',
              feeling: '뜻을 몰라 긴장되고 무서운 기분',
            },
            teacher: {
              thought: '무슨 일 때문에 마음이 상했는지 바로 알기 어렵구나. 차분하게 이유를 말해 주면 도와줄 수 있을 텐데.',
              feeling: '상황을 알기 어려워 걱정됨',
            },
          }
        : m.id === 'eokgga'
        ? {
            grandma: {
              thought: '억까라니 그게 무슨 소리니? 말끝이 세서 누가 크게 싸우는 줄 알고 할머니 가슴이 철렁했구나.',
              feeling: '센 말투에 가슴이 철렁함',
            },
            grandpa: {
              thought: '억까가 무슨 소리니? 까마귀 소리 같기도 하고, 혹시 나쁜 말은 아닌지 걱정이 되는구나.',
              feeling: '낯설고 걱정되는 마음',
            },
            transfer: {
              thought: '내가 나쁜 의도로 그런 게 아닌데 ‘억지로 깐다’고 하니까 오해받는 것 같아 나도 기분이 상하네.',
              feeling: '오해받는 것 같아 속상함',
            },
            younger: {
              thought: '‘까’가 무슨 뜻이에요? 무서운 말 같아서 내가 잘못한 줄 알고 깜짝 놀랐어요.',
              feeling: '혼나는 줄 알고 놀람',
            },
            teacher: {
              thought: '억울한 마음이 들었구나. 하지만 거친 줄임말 대신 왜 억울한지 이유를 설명해 주면 친구들도 금방 이해할 거예요.',
              feeling: '이유를 알고 싶어 안타까움',
            },
          }
        : {
            grandma: {
              thought: '점메추라니 점심에 메추리알 반찬을 해 달라는 뜻이니? 무슨 음식 이름인지 한참 고민했구나.',
              feeling: '음식 이름으로 오해해 어리둥절함',
            },
            grandpa: {
              thought: '점메추? 메추리알을 점심에 먹자는 뜻인가? 암호처럼 줄여 말하니 무슨 음식인지 한참 생각했네.',
              feeling: '암호처럼 느껴져 어리둥절함',
            },
            transfer: {
              thought: '세 글자 암호처럼 들려서 처음엔 무슨 뜻인지 전혀 몰랐어. 그냥 점심 메뉴를 물어보는 거였구나!',
              feeling: '대화에 끼기 어려워 막막함',
            },
            younger: {
              thought: '점메추가 뭐예요? 메추리알 먹는 날이에요? 무슨 뜻인지 풀어서 말해 주면 나도 같이 고를 수 있어요!',
              feeling: '단어 뜻이 아리송함',
            },
            teacher: {
              thought: '글자를 너무 많이 줄이면 처음 듣는 어른이나 친구는 무슨 뜻인지 알아듣기 어려워요. 문장으로 풀어서 물어보면 더 다정해요.',
              feeling: '말이 너무 줄여져 아쉬움',
            },
          },
  })),
  {
    keywords: ['야르'],
    label: '야르',
    vibe: 'excited',
    explanation: '‘야르’는 기분이 아주 좋거나 신날 때, 또는 기대한 일이 잘 풀렸을 때 탄성처럼 외치는 유행 감탄사예요.',
    properKorean: '와, 정말 신난다! 기분이 최고로 좋아!',
    empathyThought: '‘야르’가 무슨 소리인지 모르는 어른이나 동생은 기쁜 표현인지 장난소리인지 바로 알기 어려워 고개를 갸웃할 수 있어요.',
    roleThoughts: {
      grandma: {
        thought: '아가야, 방금 ‘야르’라고 외친 게 무슨 노래 가사니? 우리 손주가 신난 것 같긴 한데 뜻은 몰라서 멍하니 보게 되는구나.',
        feeling: '뜻을 몰라 고개를 갸웃함',
      },
      grandpa: {
        thought: '허허, ‘야르’라니 외국 만화에 나오는 소리인가? 기분이 좋은 모양인데 우리말로 말해 주면 할아버지도 같이 손뼉 쳐 줄 텐데!',
        feeling: '소리만 들려 어리둥절함',
      },
      transfer: {
        thought: '다들 신나서 ‘야르’라고 외치는데 나는 저 말이 무슨 놀이에서 나온 신호인지 몰라서 혼자 웃지 못하고 눈치만 보게 돼.',
        feeling: '혼자만 신호를 몰라 서먹함',
      },
      younger: {
        thought: '히히, 언니 오빠가 외치는 ‘야르’가 재미있는 주문 소리 같아요! 무슨 뜻인지도 모른 채 나도 모르게 따라 하게 돼요.',
        feeling: '주문 같아서 신기하지만 아리송함',
      },
      teacher: {
        thought: '무언가 아주 신나고 즐거운 일이 있었구나! 그런데 교실에서는 낯선 감탄사 대신 기쁜 이유를 바른 우리말로 나누면 모두가 함께 축하할 수 있어요.',
        feeling: '기쁜 이유를 우리말로 듣고 싶음',
      },
    },
  },
  {
    keywords: ['럭키비키', '원영적 사고'],
    label: '럭키비키',
    vibe: 'english',
    explanation: '‘행운(Lucky)’과 영어 이름 ‘비키(Vicky)’를 합쳐, 속상하거나 힘든 일이 생겨도 “오히려 나에게 좋은 일이 될 거야!” 하고 긍정적으로 생각하는 유행어예요.',
    properKorean: '조금 아쉽지만 덕분에 더 좋은 기회가 올 거라고 생각하니 힘이 나!',
    empathyThought: '이 말을 처음 듣는 할머니나 동생은 ‘비키가 누구 이름이지?’ 하며 뜻을 바로 떠올리지 못해 어리둥절할 수 있어요.',
    roleThoughts: {
      grandma: {
        thought: '럭키비키? 우리 손주 친구 중에 비키라는 외국 친구가 새로 왔나 싶구나.',
        feeling: '사람 이름으로 오해해 궁금함',
      },
      grandpa: {
        thought: '영어가 길게 이어져서 무슨 과자 이름인가 싶네. 좋은 뜻이라면 우리말로 들려주겠니?',
        feeling: '영어가 섞여 낯섦',
      },
      transfer: {
        thought: '나도 긍정적으로 말하고 싶은데 ‘럭키비키’가 정확히 어떤 뜻인지 몰라서 같이 웃어주기가 어렵네.',
        feeling: '뜻을 몰라 어색함',
      },
      younger: {
        thought: '비키가 누구예요? 만화 캐릭터 이름인가요? 나도 알려 주면 써 보고 싶어요!',
        feeling: '캐릭터 이름인 줄 알고 호기심',
      },
      teacher: {
        thought: '어려운 일도 긍정적으로 바라보는 마음은 정말 예뻐요! 뜻을 모르는 분께는 ‘행운이 찾아올 거야’라고 풀어서 말해 주면 더 좋아요.',
        feeling: '긍정적인 마음은 칭찬하고 싶음',
      },
    },
  },
  {
    keywords: ['중꺾마'],
    label: '중꺾마',
    vibe: 'acronym',
    explanation: '‘중요한 것은 꺾이지 않는 마음’이라는 긴 문장을 앞 글자만 따서 세 글자로 줄인 말로, 포기하지 말자는 뜻이에요.',
    properKorean: '어렵더라도 끝까지 포기하지 않는 마음이 가장 중요해! 우리 힘내 보자.',
    empathyThought: '줄임말을 모르는 어른들은 ‘중꺾마’가 무슨 물건이나 동물 이름인지 몰라 대화를 이해하기 어려워하세요.',
    roleThoughts: {
      grandma: {
        thought: '중꺾마가 뭐니? 중간에 꺾이는 마당이라는 뜻인가? 글자를 너무 줄여서 뜻을 짐작조차 못 하겠구나.',
        feeling: '단어가 낯설어 답답함',
      },
      grandpa: {
        thought: '중꺾마? 무슨 사자성어 같기도 하고 운동 기술 이름 같기도 하구나. 풀어서 말해 주면 훨씬 멋질 텐데!',
        feeling: '줄임말이라 뜻을 모름',
      },
      transfer: {
        thought: '세 글자 줄임말이라 처음엔 무슨 벌칙이나 게임 이름인 줄 알고 괜히 긴장했어.',
        feeling: '줄임말이 암호 같아 긴장됨',
      },
      younger: {
        thought: '중꺾마가 뭐예요? 마법 지팡이 이름인가요? 풀어서 말해 주면 나도 포기 안 할래요!',
        feeling: '물건 이름인 줄 알고 아리송함',
      },
      teacher: {
        thought: '끝까지 포기하지 말자는 아주 멋진 뜻이 담겨 있네요! 원래 문장인 ‘중요한 것은 꺾이지 않는 마음’ 그대로 말하면 울림이 훨씬 커요.',
        feeling: '원래 문장으로 들으면 더 감동적임',
      },
    },
  },
  {
    keywords: ['완내스'],
    label: '완내스',
    vibe: 'acronym',
    explanation: '‘완전 내 스타일(내가 정말 좋아하는 모습이나 취향)’을 줄여서 부르는 말이에요.',
    properKorean: '와, 이거 정말 내 마음에 쏙 들고 참 멋지다!',
    empathyThought: '외국어나 줄임말이 익숙하지 않은 사람은 암호처럼 들려 어떤 점이 좋다는 건지 알기 어려워요.',
  },
  {
    keywords: ['갓생'],
    label: '갓생',
    vibe: 'english',
    explanation: '부지런하고 알차게 하루를 보내며 열심히 노력하는 멋진 생활을 뜻하는 유행어예요.',
    properKorean: '오늘 계획한 일을 차근차근 실천해서 정말 보람차고 뿌듯한 하루였어!',
    empathyThought: '뜻을 모르는 친구나 어르신은 ‘갑자기 왜 신(God) 이야기를 하지?’ 하고 고개를 갸웃하실 수 있어요.',
  },
  {
    keywords: ['느좋'],
    label: '느좋',
    vibe: 'acronym',
    explanation: '‘느낌 좋다’를 두 글자로 줄여서, 분위기나 모습이 참 멋지고 마음에 든다고 표현할 때 쓰는 말이에요.',
    properKorean: '여기 분위기가 정말 따뜻하고 기분이 참 좋네요!',
    empathyThought: '글자를 너무 많이 줄이면 처음 듣는 사람은 무슨 뜻인지 짐작조차 하기 어려워 소외감을 느낄 수 있어요.',
  },
  {
    keywords: ['만반잘부'],
    label: '만반잘부',
    vibe: 'acronym',
    explanation: '‘만나서 반가워, 잘 부탁해’라는 인사말을 앞 글자만 따서 줄인 말이에요.',
    properKorean: '만나서 정말 반가워요! 앞으로 우리 사이좋게 지내요.',
    empathyThought: '처음 만난 친구에게 줄임말로 인사하면 장난치는 것처럼 보이거나 서먹하게 느껴질 수 있어요.',
  },
  {
    keywords: ['스불재'],
    label: '스불재',
    vibe: 'acronym',
    explanation: '‘스스로 불러온 재앙’을 줄여서, 내가 한 행동 때문에 곤란한 일이 생겼을 때 쓰는 말이에요.',
    properKorean: '내가 미리 준비하지 않아서 이런 일이 생겼네. 다음엔 꼭 미리 챙겨야지!',
    empathyThought: '‘재앙’이라는 무서운 말의 줄임말이라 뜻을 모르면 놀라거나 무슨 큰일이 난 줄 알 수 있어요.',
  },
  {
    keywords: ['잼민이'],
    label: '잼민이',
    vibe: 'teasing',
    explanation: '어린 학생이나 초등학생을 장난스럽게 부르던 인터넷 유행어지만, 듣는 사람이 놀림받는다고 느낄 수 있는 말이에요.',
    properKorean: '귀여운 동생 / 씩씩한 우리 초등학생 친구',
    empathyThought: '당사자인 초등학생 친구가 들으면 나를 낮춰 부르며 놀리는 것 같아 마음이 많이 상하고 속상할 수 있어요.',
  },
  {
    keywords: ['알잘딱깔센'],
    label: '알잘딱깔센',
    vibe: 'acronym',
    explanation: '‘알아서 잘 딱 깔끔하고 센스 있게’라는 말을 앞 글자만 모아서 줄인 유행어예요.',
    properKorean: '상황에 맞게 꼼꼼하고 정성스럽게 잘 해 주어서 정말 고마워!',
    empathyThought: '여섯 글자나 되는 줄임말은 듣는 사람이 무슨 뜻인지 한참 생각해도 알 수 없어 대화가 끊어질 수 있어요.',
  },
  {
    keywords: ['tmi', '티엠아이'],
    label: 'TMI',
    vibe: 'english',
    explanation: '영어 ‘Too Much Information’의 줄임말로, 굳이 알지 않아도 될 만큼 시시콜콜하고 너무 많은 정보라는 뜻이에요.',
    properKorean: '참고로 이런 작은 이야기도 있단다! / 내가 덧붙여서 말해 줄게.',
    empathyThought: '열심히 이야기했는데 상대가 TMI라고 하면 “내 이야기가 지루하고 듣기 싫은가?” 하며 서운할 수 있어요.',
  },
  {
    keywords: ['폼 미쳤다', '폼미쳤다'],
    label: '폼 미쳤다',
    vibe: 'rough',
    explanation: '어떤 일을 하는 실력이나 모습이 평소보다 훨씬 뛰어나고 대단하다는 뜻으로 감탄할 때 쓰는 유행어예요.',
    properKorean: '우와, 오늘 실력이 정말 대단하고 눈부시게 멋지다!',
    empathyThought: '‘미쳤다’라는 거친 단어가 들어가 있어서 어르신이나 어린 동생이 들으면 나쁜 말이나 욕설로 오해할 수 있어요.',
  },
  {
    keywords: ['팩폭'],
    label: '팩폭',
    vibe: 'rough',
    explanation: '‘팩트(사실) 폭격’의 줄임말로, 상대방이 아파할 만한 사실을 너무 세고 직설적으로 말할 때 쓰는 말이에요.',
    properKorean: '솔직한 내 생각도 조심스럽게 나누어 줄게. 함께 더 좋은 방법을 찾아보자!',
    empathyThought: '‘폭격’이라는 거친 표현 때문에 듣는 친구가 비난받았다고 느끼며 마음의 상처를 입을 수 있어요.',
  },
  {
    keywords: ['갑분싸'],
    label: '갑분싸',
    vibe: 'acronym',
    explanation: '‘갑자기 분위기 싸해짐’을 줄여서, 즐겁던 분위기가 갑자기 어색하고 조용해졌을 때 쓰는 말이에요.',
    properKorean: '조금 어색해졌네! 우리 다시 즐거운 이야기로 분위기를 풀어 보자.',
    empathyThought: '이 말을 들은 사람은 “혹시 내가 실수해서 분위기가 안 좋아졌나?” 하고 눈치를 보며 위축될 수 있어요.',
  },
  {
    keywords: ['칠가이', 'chill guy', '칠 가이'],
    label: '칠 가이 (Chill guy)',
    vibe: 'english',
    explanation: '어떤 일이 일어나도 당황하지 않고 여유롭고 태평하게 넘기는 캐릭터를 빗대어 쓰는 영어 밈이에요.',
    properKorean: '당황하지 않고 침착하고 여유롭게 잘 해내고 있네! 참 멋지다.',
    empathyThought: '영어가 섞인 밈을 모르는 친구나 어르신은 무슨 사람 이름인지 몰라 대화에 함께 끼기 어렵다고 느낄 수 있어요.',
  },
  {
    keywords: ['스끼비디', '스키비디', 'skibidi'],
    label: '스끼비디 (Skibidi)',
    vibe: 'excited',
    explanation: '유튜브 쇼츠 애니메이션에서 나온 소리를 따라 하며 장난치거나 신기하다는 뜻으로 쓰는 유행어예요.',
    properKorean: '우와, 정말 재미있고 신기한 장면이네!',
    empathyThought: '영상을 보지 않은 친구나 어른들은 뜻을 전혀 알 수 없고, 시끄러운 장난처럼 들려 답답하거나 어리둥절할 수 있어요.',
  },
  {
    keywords: ['시그마', 'sigma'],
    label: '시그마 (Sigma)',
    vibe: 'english',
    explanation: '남의 시선을 신경 쓰지 않고 자신감 있고 멋지게 행동하는 사람을 장난스럽게 부를 때 쓰는 말이에요.',
    properKorean: '자기 생각을 꿋꿋하게 잘 지키고 씩씩하게 행동해서 정말 멋지다!',
    empathyThought: '‘시그마’라는 낯선 단어를 들으면 수학 기호인지 사람 이름인지 헷갈려서 무슨 칭찬인지 바로 알기 어려워요.',
  },
  {
    keywords: ['뇌절'],
    label: '뇌절',
    vibe: 'rough',
    explanation: '같은 장난이나 말을 멈추지 않고 너무 지나치게 반복해서 주변 사람이 지치거나 재미없어질 때 쓰는 말이에요.',
    properKorean: '그만하면 충분할 것 같아. 이제 다른 즐거운 이야기를 해 보자!',
    empathyThought: '장난을 치던 친구에게 갑자기 ‘뇌절’이라고 하면 핀잔을 주는 것처럼 들려 마음이 무안하고 상할 수 있어요.',
  },
  {
    keywords: ['마라탕후루', '탕탕후루후루'],
    label: '탕탕후루후루',
    vibe: 'excited',
    explanation: '노래 가사와 춤 챌린지가 유행하면서 신이 날 때 리듬에 맞춰 따라 부르는 유행어예요.',
    properKorean: '맛있는 간식을 먹으니 정말 신나고 기분이 좋네!',
    empathyThought: '노래를 모르는 어르신은 갑자기 무슨 음식을 사 달라는 건지, 춤을 추자는 건지 헷갈려 하실 수 있어요.',
  },
  {
    keywords: ['레전드'],
    label: '레전드',
    vibe: 'english',
    explanation: '원래 ‘전설’이라는 뜻의 영어 단어로, 깜짝 놀랄 만큼 엄청나거나 기억에 오래 남을 멋진 장면을 보고 외치는 말이에요.',
    properKorean: '정말 대단하고 오래오래 기억에 남을 만큼 멋진 장면이야!',
    empathyThought: '영어 단어에 익숙하지 않은 동생이나 어르신은 좋은 뜻인지 무서운 뜻인지 바로 알아듣기 어려워요.',
  },
  {
    keywords: ['오운완'],
    label: '오운완',
    vibe: 'acronym',
    explanation: '‘오늘 운동 완료’의 앞 글자만 따서 줄인 말로, 계획한 운동이나 줄넘기를 뿌듯하게 끝냈을 때 써요.',
    properKorean: '오늘 약속한 운동을 끝까지 다 마쳐서 정말 뿌듯해!',
    empathyThought: '줄임말을 모르면 ‘오운완’이 무슨 낯선 사람 이름이나 동네 이름인가 싶어 고개를 갸웃하게 돼요.',
  },
  {
    keywords: ['갓벽'],
    label: '갓벽',
    vibe: 'english',
    explanation: '신(God)처럼 빈틈없이 ‘완벽하다’는 뜻으로, 무언가를 아주 훌륭하게 잘 해냈을 때 감탄하며 쓰는 말이에요.',
    properKorean: '빈틈없이 정성껏 해내서 정말 완벽하고 대단하다!',
    empathyThought: '‘갓’과 ‘완벽’을 합친 줄임말이라 처음 들으면 무슨 벽 이름인가 하며 뜻을 헷갈리기 쉬워요.',
  },
];

function findKnownMeme(text: string): KnownMemeInfo | undefined {
  const lower = text.trim().toLowerCase();
  if (!lower) return undefined;
  return KNOWN_MEMES.find((item) =>
    item.keywords.some((kw) => lower.includes(kw.toLowerCase()) || kw.toLowerCase().includes(lower)),
  );
}

function detectRoleKey(listenerRole: string): RoleKey | 'other' {
  if (listenerRole.includes('할머니')) return 'grandma';
  if (listenerRole.includes('할아버지')) return 'grandpa';
  if (listenerRole.includes('전학생') || listenerRole.includes('친구')) return 'transfer';
  if (listenerRole.includes('1학년') || listenerRole.includes('동생')) return 'younger';
  if (listenerRole.includes('담임') || listenerRole.includes('선생님')) return 'teacher';
  return 'other';
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

function inferVibe(word: string): MemeVibe {
  if (/[a-zA-Z]/.test(word)) return 'english';
  if (/[0-9!~ㅋㅎ]+/.test(word)) return 'excited';
  if (word.length <= 4) return 'acronym';
  return 'teasing';
}

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
  if (isRestrictedForElementary(`${memeWord} ${question}`)) {
    return {
      topicLabel: '조심해야 할 표현',
      explanation:
        '방금 물어본 말은 초등학교 3학년 학생들이 사용하는 말이 아니에요. 어른들이나 일부 인터넷에서 쓰이는 거친 말 또는 성·신체와 관련된 부적절한 표현이라서, 구체적인 뜻을 배우거나 따라 말하지 않는 것이 안전해요.',
      properKorean:
        '기쁘거나 속상하거나 놀란 마음을 전할 때는 “정말 대단해!”, “조금 속상한 일이 있었어”처럼 서로 기분 좋아지는 바른 우리말을 써 보아요.',
      empathyThought:
        '이런 부적절하거나 거친 말을 들은 할머니·친구·선생님은 깜짝 놀라며 “어디서 이런 말을 들었을까?” 하고 많이 걱정하고 마음이 상하실 수 있어요.',
      encouragement:
        '모르는 말을 함부로 따라 쓰지 않고 따봄쌤에게 먼저 확인해 주어서 정말 안전하고 현명해요!',
    };
  }

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
      encouragement: `“${memeWord.trim() || matched.label}”의 뜻을 먼저 확인하려는 우리 학동이 정말 멋져요!`,
    };
  }

  const topic = extractTopicFromInputs(memeWord, question);
  const vibe = inferVibe(topic);

  if (vibe === 'english') {
    return {
      topicLabel: topic,
      explanation: `“${topic}”처럼 영어나 외래어가 섞인 유행 표현은 영상·게임에서 빠르게 퍼지지만, 영어를 아직 배우는 친구나 어른은 뜻을 바로 떠올리기 어려워요.`,
      properKorean: `“${topic}” 대신 지금 내가 전하고 싶은 기분이나 생각을 누구나 이해할 수 있는 쉬운 우리말 문장으로 풀어서 말해 보아요.`,
      empathyThought: `외국어가 낯선 할머니·할아버지나 1학년 동생은 “무슨 영어 암호일까?” 하고 고개를 갸웃하며 대화에서 멀어진 느낌을 받을 수 있어요.`,
      encouragement: `새로운 말 “${topic}”을 그대로 쓰지 않고 따봄쌤에게 물어봐 주어 정말 기특해요!`,
    };
  }

  if (vibe === 'excited') {
    return {
      topicLabel: topic,
      explanation: `“${topic}”처럼 소리나 리듬을 강조해 외치는 밈은 순간적으로 재미를 주지만, 듣는 상황이나 상대에 따라 시끄러운 장난처럼 들려 오해를 부를 수 있어요.`,
      properKorean: `“우와, 정말 신난다!” 또는 “지금 기분이 참 좋아요!”처럼 기쁜 이유를 함께 말하면 훨씬 따뜻한 대화가 돼요.`,
      empathyThought: `유행 영상이나 노래를 보지 못한 친구와 선생님은 “갑자기 왜 저런 소리를 낼까?” 하고 당황하거나 수업·대화에 집중하기 어려울 수 있어요.`,
      encouragement: `“${topic}” 같은 유행 소리를 상황에 맞게 구분하려는 3학년 학동의 태도가 아주 훌륭해요!`,
    };
  }

  if (vibe === 'acronym') {
    return {
      topicLabel: topic,
      explanation: `“${topic}”처럼 글자 수를 짧게 줄여 부르는 말은 빠르게 쓰기는 편하지만, 원래 문장을 모르면 뜻을 전혀 알아들을 수 없는 암호가 되어 버려요.`,
      properKorean: `“${topic}”을 원래 말뜻 그대로 풀어서 차근차근 말하면 할머니부터 동생까지 누구나 미소 지으며 알아들을 수 있어요.`,
      empathyThought: `전학 온 친구나 어르신은 “내가 모르는 비밀 단어인가? 나만 빼고 이야기하나?” 하고 서먹하고 외로운 마음이 들 수 있어요.`,
      encouragement: `짧은 줄임말 “${topic}” 대신 고운 우리말을 찾으려는 노력이 정말 멋져요!`,
    };
  }

  return {
    topicLabel: topic,
    explanation: `“${topic}”에 대해 물어봐 주었군요! 친구들 사이에서 유행하는 말이라도, 듣는 사람이 뜻을 모르거나 장난으로 상처받을 수 있으니 먼저 의미를 살피는 것이 중요해요.`,
    properKorean: `“${topic}” 대신 상대방의 마음을 배려하는 다정한 우리말로 내 생각을 또박또박 전해 보아요.`,
    empathyThought: `이 말을 처음 듣는 사람은 “나를 놀리는 걸까, 무슨 뜻일까?” 하고 어리둥절하거나 마음이 서운해질 수 있어요.`,
    encouragement: `스스로 뜻을 확인하고 바른 우리말을 찾으려는 3학년 학동의 마음이 정말 기특해요!`,
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
  if (isRestrictedForElementary(`${memeWord} ${studentGuess}`)) {
    const roleKey = detectRoleKey(listenerRole);
    return {
      listenerThought:
        roleKey === 'grandma' || roleKey === 'grandpa'
          ? '어이구, 우리 귀한 손주가 어디서 그런 거칠고 어른스러운 말을 들었을까? 뜻도 알 필요가 없는 말이라서 절대 따라 해서는 안 된단다.'
          : roleKey === 'teacher'
          ? '이 표현은 초등학교 3학년 친구들이 사용하는 말이 아니라 조심해야 할 거칠거나 부적절한 말이에요. 뜻을 따라 찾지 말고 고운 우리말만 사용하도록 해요.'
          : '깜짝 놀랐어요! 우리 초등학생 친구들이 쓰는 말이 아닌 것 같아서 괜히 무섭고 마음이 불편해져요.',
      feelingLabel: '깜짝 놀라고 조심스러운 마음',
      gentleAdvice:
        '이 말은 초등학생이 배우거나 사용하는 말이 아니에요. 우리 마음을 전할 때는 “정말 멋져!”, “함께 놀자!”처럼 따뜻하고 바른 우리말을 사용해 보아요.',
    };
  }

  const cleanMeme = memeWord.trim() || '유행어';
  const roleKey = detectRoleKey(listenerRole);
  const matchedMeme = findKnownMeme(cleanMeme);
  const exhibit = MEME_EXHIBITS.find((m) => m.memeWord === cleanMeme);
  const exhibitPreset = exhibit?.empathyListeners.find(
    (l) => listenerRole.includes(l.role) || l.role.includes(listenerRole),
  );
  const rolePreset = roleKey !== 'other' ? matchedMeme?.roleThoughts?.[roleKey] : undefined;

  const properSuggestion =
    matchedMeme?.properKorean ||
    exhibit?.properKorean ||
    '누구나 바로 알아들을 수 있는 따뜻하고 고운 우리말';

  const guessPrefix = studentGuess.trim()
    ? `우리 학동이 “${studentGuess.trim()}”라고 생각해 본 것처럼, `
    : '';

  if (rolePreset) {
    return {
      listenerThought: rolePreset.thought,
      feelingLabel: rolePreset.feeling,
      gentleAdvice: `${guessPrefix}${listenerRole}께는 “${cleanMeme}” 대신 “${properSuggestion}”처럼 뜻을 풀어서 말씀드리면 마음이 훨씬 따뜻하게 이어져요.`,
    };
  }

  if (exhibitPreset) {
    return {
      listenerThought: exhibitPreset.thought,
      feelingLabel: exhibitPreset.feeling,
      gentleAdvice: `${guessPrefix}${listenerRole}께서도 대화를 함께 즐길 수 있도록 “${properSuggestion}”처럼 바른 우리말로 전하면 마음이 훨씬 가까워져요.`,
    };
  }

  const vibe = matchedMeme?.vibe || inferVibe(cleanMeme);

  if (roleKey === 'grandma') {
    return {
      listenerThought:
        vibe === 'english'
          ? `아가야, “${cleanMeme}”라니 영어인지 외래어인지 할머니는 영 모르겠구나. 우리 손주가 무슨 뜻으로 한 말인지 쉬운 우리말로 들려줄래?`
          : vibe === 'excited'
          ? `어이구, 손주가 “${cleanMeme}” 하고 신나서 외치는 것 같은데 할머니는 무슨 말인지 몰라서 덩달아 어리둥절하구나.`
          : vibe === 'rough'
          ? `“${cleanMeme}”라니 말소리가 조금 거칠게 들려서 할머니가 깜짝 놀랐구나. 속상한 일이 있으면 차분히 이야기해 보렴.`
          : `“${cleanMeme}”가 무슨 줄임말인지 할머니는 도통 알아들을 수가 없네. 풀어서 말해 주면 할머니도 같이 이야기할 텐데!`,
      feelingLabel: vibe === 'rough' ? '놀라고 걱정되는 마음' : '생소하고 궁금한 마음',
      gentleAdvice: `${guessPrefix}할머니께는 “${cleanMeme}” 대신 “${properSuggestion}”처럼 고운 우리말로 말씀드리면 환하게 웃으실 거예요!`,
    };
  }

  if (roleKey === 'grandpa') {
    return {
      listenerThought:
        vibe === 'english'
          ? `허허, “${cleanMeme}”라는 외국 말이 무슨 뜻인고? 할아버지 귀에는 낯선 암호처럼 들리니 우리말로 풀어서 들려주겠니?`
          : vibe === 'excited'
          ? `허허, 갑자기 “${cleanMeme}”라고 크게 외치니 무슨 놀이가 시작된 건가 싶어 할아버지가 두리번거리게 되는구나.`
          : `요즘 아이들이 쓰는 “${cleanMeme}”라는 말이 너무 짧거나 낯설어서 할아버지는 어떤 뜻인지 짐작하기가 어렵구나.`,
      feelingLabel: '낯설지만 알고 싶은 마음',
      gentleAdvice: `${guessPrefix}할아버지께 “${properSuggestion}”라고 차근차근 설명해 드리면 대화의 즐거움을 함께 나누실 수 있어요.`,
    };
  }

  if (roleKey === 'transfer') {
    return {
      listenerThought:
        vibe === 'teasing' || vibe === 'rough'
          ? `다들 “${cleanMeme}”라고 말하는데 혹시 나를 놀리거나 싫어해서 저런 말을 하는 건 아닐까 싶어 마음이 움츠러들어.`
          : `반 친구들이 다 아는 “${cleanMeme}”라는 말을 나만 처음 들어 봐서, 대화에 끼지 못하고 혼자 떨어져 있는 기분이 들어 서먹해.`,
      feelingLabel: '소외되고 서먹한 기분',
      gentleAdvice: `${guessPrefix}전학 온 친구가 외롭지 않도록 “${properSuggestion}”처럼 모두가 바로 아는 말로 다정하게 말을 건네 보아요.`,
    };
  }

  if (roleKey === 'younger') {
    return {
      listenerThought:
        vibe === 'rough'
          ? `3학년 언니·오빠가 “${cleanMeme}”라고 크게 말하니까 화가 난 것처럼 보여서 조금 무섭고 눈치를 보게 돼요.`
          : `우와, “${cleanMeme}”가 무슨 뜻이에요? 만화 주문 같아서 재미있긴 한데 무슨 뜻인지 몰라서 고개만 갸웃하게 돼요.`,
      feelingLabel: vibe === 'rough' ? '무섭고 긴장되는 기분' : '신기하지만 아리송한 기분',
      gentleAdvice: `${guessPrefix}1학년 동생은 뜻도 모른 채 그대로 따라 말하기 쉬우니 “${properSuggestion}”처럼 바른 본보기가 되어 주세요!`,
    };
  }

  if (roleKey === 'teacher') {
    return {
      listenerThought:
        vibe === 'excited'
          ? `우리 반 친구들이 “${cleanMeme}”라며 즐거워하는 모습은 보기 좋지만, 교실에서는 뜻을 모르는 친구도 함께 공감할 수 있는 말로 표현하면 더 좋겠어요.`
          : `“${cleanMeme}”라는 밈에는 친구들끼리의 재미가 담겨 있겠지만, 듣는 친구가 오해하거나 소외되지 않도록 배려하는 말투로 바꾸어 보면 어떨까요?`,
      feelingLabel: '이해하려 하지만 배려가 필요함',
      gentleAdvice: `${guessPrefix}선생님께서 바라시는 것처럼 교실에서는 “${properSuggestion}”라고 표현해 보면 모두가 웃는 따뜻한 교실이 될 거예요!`,
    };
  }

  return {
    listenerThought: `“${cleanMeme}”라는 말을 처음 들으니 어떤 상황인지 바로 떠오르지 않아 고개가 갸웃해져요. 뜻을 알면 함께 공감할 텐데 지금은 무슨 마음인지 잘 전해지지 않아 조금 어리둥절해요.`,
    feelingLabel: '어리둥절하고 낯선 기분',
    gentleAdvice: `${guessPrefix}${listenerRole}의 마음을 한 번 더 떠올리며 “${properSuggestion}”처럼 누구나 바로 알 수 있는 고운 우리말로 바꾸어 말해 보아요.`,
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
