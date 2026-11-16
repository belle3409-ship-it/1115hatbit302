import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { AvatarColorId, MuseumZoneId } from '../data/museumExhibits';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationTypeValue = (typeof OperationType)[keyof typeof OperationType];

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationTypeValue;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationTypeValue,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface UserProfileDoc {
  uid: string;
  nickname: string;
  avatarColor: AvatarColorId;
  visitedZones: string[];
  completedQuizzes: string[];
  stampsCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface QaEntryDoc {
  id: string;
  userId: string;
  zone: Exclude<MuseumZoneId, 'atrium'>;
  memeWord: string;
  question: string;
  properKorean: string;
  empathyThought: string;
  answer: string;
  createdAt?: Timestamp;
}

export interface SharedPhraseDoc {
  id: string;
  authorId: string;
  authorNickname: string;
  visibility: 'public';
  memeWord: string;
  properSentence: string;
  empathyNote: string;
  createdAt?: Timestamp;
}

export interface ClassroomQaDoc {
  id: string;
  authorId: string;
  authorNickname: string;
  visibility: 'public';
  zone: Exclude<MuseumZoneId, 'atrium'>;
  memeWord: string;
  question: string;
  properKorean: string;
  empathyThought: string;
  answer: string;
  createdAt?: Timestamp;
}

const SCHOLAR_ID_KEY = 'seodang_scholar_id_v1';

export function getOrCreateScholarId(): string {
  try {
    const existing = localStorage.getItem(SCHOLAR_ID_KEY);
    if (existing && /^scholar_[a-zA-Z0-9_-]{8,50}$/.test(existing)) {
      return existing;
    }
    const generated = `scholar_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SCHOLAR_ID_KEY, generated);
    return generated;
  } catch {
    return `scholar_${Date.now().toString(36)}_guest`;
  }
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
}

export async function ensureUserProfile(user: User): Promise<UserProfileDoc> {
  const userPath = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as UserProfileDoc;
    }
    const nickname = (user.displayName || '3학년 탐험가').trim().slice(0, 40) || '3학년 탐험가';
    const initialData = {
      uid: user.uid,
      nickname,
      avatarColor: 'sky' as AvatarColorId,
      visitedZones: ['atrium'],
      completedQuizzes: [],
      stampsCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, initialData);
    return {
      ...initialData,
      createdAt: undefined,
      updatedAt: undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function updateUserProgress(
  uid: string,
  patch: {
    nickname?: string;
    avatarColor?: AvatarColorId;
    visitedZones?: string[];
    completedQuizzes?: string[];
    stampsCount?: number;
  },
): Promise<void> {
  const userPath = `users/${uid}`;
  const ref = doc(db, 'users', uid);
  try {
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (patch.nickname !== undefined) {
      payload.nickname = patch.nickname.trim().slice(0, 40) || '3학년 탐험가';
    }
    if (patch.avatarColor !== undefined) {
      payload.avatarColor = patch.avatarColor;
    }
    if (patch.visitedZones !== undefined) {
      payload.visitedZones = patch.visitedZones.slice(0, 10);
    }
    if (patch.completedQuizzes !== undefined) {
      payload.completedQuizzes = patch.completedQuizzes.slice(0, 30);
    }
    if (patch.stampsCount !== undefined) {
      payload.stampsCount = Math.max(0, Math.min(50, Math.floor(patch.stampsCount)));
    }
    await updateDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function saveQaEntry(
  uid: string,
  entry: {
    zone: Exclude<MuseumZoneId, 'atrium'>;
    memeWord: string;
    question: string;
    properKorean: string;
    empathyThought: string;
    answer: string;
  },
): Promise<string> {
  const entryId = sanitizeId(`qa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const entryPath = `users/${uid}/qaEntries/${entryId}`;
  const ref = doc(db, 'users', uid, 'qaEntries', entryId);
  try {
    await setDoc(ref, {
      userId: uid,
      zone: entry.zone,
      memeWord: entry.memeWord.trim().slice(0, 60) || '우리말 질문',
      question: entry.question.trim().slice(0, 240) || '질문',
      properKorean: entry.properKorean.trim().slice(0, 240),
      empathyThought: entry.empathyThought.trim().slice(0, 300),
      answer: entry.answer.trim().slice(0, 600) || '설명',
      createdAt: serverTimestamp(),
    });
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, entryPath);
  }
}

export async function deleteQaEntry(uid: string, entryId: string): Promise<void> {
  const entryPath = `users/${uid}/qaEntries/${entryId}`;
  const ref = doc(db, 'users', uid, 'qaEntries', entryId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, entryPath);
  }
}

export function subscribeQaEntries(
  uid: string,
  onData: (entries: QaEntryDoc[]) => void,
  onError: (err: Error) => void,
) {
  const path = `users/${uid}/qaEntries`;
  const q = query(
    collection(db, 'users', uid, 'qaEntries'),
    where('userId', '==', uid),
    limit(60),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: QaEntryDoc[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<QaEntryDoc, 'id'>),
        }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        .slice(0, 40);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        onError(e as Error);
      }
    },
  );
}

export async function saveClassroomQa(
  authorId: string,
  nickname: string,
  entry: {
    zone: Exclude<MuseumZoneId, 'atrium'>;
    memeWord: string;
    question: string;
    properKorean: string;
    empathyThought: string;
    answer: string;
  },
): Promise<string> {
  const entryId = sanitizeId(`cqa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const entryPath = `classroomQa/${entryId}`;
  const ref = doc(db, 'classroomQa', entryId);
  try {
    await setDoc(ref, {
      authorId,
      authorNickname: nickname.trim().slice(0, 40) || '3학년 학동',
      visibility: 'public',
      zone: entry.zone,
      memeWord: entry.memeWord.trim().slice(0, 60) || '우리말 질문',
      question: entry.question.trim().slice(0, 240) || '질문',
      properKorean: entry.properKorean.trim().slice(0, 240),
      empathyThought: entry.empathyThought.trim().slice(0, 300),
      answer: entry.answer.trim().slice(0, 600) || '설명',
      createdAt: serverTimestamp(),
    });
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, entryPath);
  }
}

export async function deleteClassroomQa(entryId: string): Promise<void> {
  const entryPath = `classroomQa/${entryId}`;
  const ref = doc(db, 'classroomQa', entryId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, entryPath);
  }
}

export function subscribeClassroomQa(
  onData: (entries: ClassroomQaDoc[]) => void,
  onError: (err: Error) => void,
) {
  const path = 'classroomQa';
  const q = query(
    collection(db, 'classroomQa'),
    where('visibility', '==', 'public'),
    limit(60),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ClassroomQaDoc[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ClassroomQaDoc, 'id'>),
        }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        .slice(0, 40);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        onError(e as Error);
      }
    },
  );
}

export async function publishSharedPhrase(
  authorId: string,
  nickname: string,
  payload: {
    memeWord: string;
    properSentence: string;
    empathyNote: string;
  },
): Promise<string> {
  const phraseId = sanitizeId(`phrase_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const path = `sharedPhrases/${phraseId}`;
  const ref = doc(db, 'sharedPhrases', phraseId);
  try {
    await setDoc(ref, {
      authorId,
      authorNickname: nickname.trim().slice(0, 40) || '3학년 학동',
      visibility: 'public',
      memeWord: payload.memeWord.trim().slice(0, 60) || '우리말',
      properSentence: payload.properSentence.trim().slice(0, 180) || '고운 말을 써요.',
      empathyNote: payload.empathyNote.trim().slice(0, 200),
      createdAt: serverTimestamp(),
    });
    return phraseId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteSharedPhrase(phraseId: string): Promise<void> {
  const path = `sharedPhrases/${phraseId}`;
  const ref = doc(db, 'sharedPhrases', phraseId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeSharedPhrases(
  onData: (phrases: SharedPhraseDoc[]) => void,
  onError: (err: Error) => void,
) {
  const path = 'sharedPhrases';
  const q = query(
    collection(db, 'sharedPhrases'),
    where('visibility', '==', 'public'),
    limit(40),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: SharedPhraseDoc[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SharedPhraseDoc, 'id'>),
        }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        .slice(0, 24);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        onError(e as Error);
      }
    },
  );
}
