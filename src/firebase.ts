import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const resolvedFirebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
};

export const firebaseProjectId = resolvedFirebaseConfig.projectId;

const app = initializeApp(resolvedFirebaseConfig);
// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  if (code === 'auth/unauthorized-domain') {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    return `Domain "${currentHost}" belum dibenarkan dalam Firebase Authentication. Sila tambah domain ini di Firebase Console → Authentication → Settings → Authorized domains.`;
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Tetingkap log masuk Google ditutup sebelum selesai.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Tetingkap pop-up disekat oleh pelayar anda. Sila benarkan pop-up untuk log masuk dengan Google.';
  }
  return error instanceof Error ? error.message : 'Gagal log masuk dengan Google. Sila cuba lagi.';
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface DeployedSite {
  id: string;
  slug: string;
  title: string;
  htmlContent: string;
  ownerId: string;
  ownerEmail: string;
  isPublished: boolean;
  fileSizeBytes: number;
  version: number;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

// Data operations
export async function getUserSites(userId: string): Promise<DeployedSite[]> {
  const sitesPath = 'sites';
  try {
    const q = query(collection(db, sitesPath), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    const sites: DeployedSite[] = [];
    snapshot.forEach(docSnap => {
      sites.push({ id: docSnap.id, ...docSnap.data() } as DeployedSite);
    });
    // Sort in memory by updatedAt descending
    return sites.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (new Date(a.updatedAt || 0).getTime());
      const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (new Date(b.updatedAt || 0).getTime());
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, sitesPath);
  }
}

export async function getSiteBySlugOrId(identifier: string): Promise<DeployedSite | null> {
  const docPath = `sites/${identifier}`;
  try {
    const docRef = doc(db, 'sites', identifier);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as DeployedSite;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function createSite(params: {
  slug: string;
  title: string;
  htmlContent: string;
  description?: string;
  user: User;
}): Promise<DeployedSite> {
  const docId = params.slug;
  const docPath = `sites/${docId}`;
  const now = serverTimestamp();
  const fileSizeBytes = new Blob([params.htmlContent]).size;

  const siteData: Record<string, any> = {
    id: docId,
    slug: params.slug,
    title: params.title.trim() || 'Untitled Page',
    htmlContent: params.htmlContent,
    ownerId: params.user.uid,
    ownerEmail: params.user.email || '',
    isPublished: true,
    fileSizeBytes,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  if (params.description?.trim()) {
    siteData.description = params.description.trim().slice(0, 300);
  }

  try {
    await setDoc(doc(db, 'sites', docId), siteData);
    return {
      ...siteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as DeployedSite;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateSite(params: {
  siteId: string;
  title: string;
  htmlContent: string;
  currentVersion: number;
  description?: string;
  isPublished?: boolean;
}): Promise<void> {
  const docPath = `sites/${params.siteId}`;
  const now = serverTimestamp();
  const fileSizeBytes = new Blob([params.htmlContent]).size;

  const updatePayload: Record<string, any> = {
    title: params.title.trim() || 'Untitled Page',
    htmlContent: params.htmlContent,
    fileSizeBytes,
    version: params.currentVersion + 1,
    updatedAt: now,
  };

  if (params.isPublished !== undefined) {
    updatePayload.isPublished = params.isPublished;
  }
  if (params.description !== undefined) {
    updatePayload.description = params.description.trim().slice(0, 300);
  }

  try {
    await updateDoc(doc(db, 'sites', params.siteId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteSite(siteId: string): Promise<void> {
  const docPath = `sites/${siteId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
