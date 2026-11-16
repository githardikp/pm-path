// Loaded on demand only (dynamic import), so people who never sign in never download Firebase.
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut as fbSignOut,
} from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from './config';
import type { CloudBackend, RemoteDoc } from './types';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

const ref = (uid: string) => doc(db, 'users', uid);

function toRemote(v: Record<string, unknown> | undefined): RemoteDoc | null {
  if (!v || typeof v.data !== 'string') return null;
  return {
    data: v.data,
    updatedAt: Number(v.updatedAt) || 0,
    deviceId: String(v.deviceId ?? ''),
  };
}

export const backend: CloudBackend = {
  onAuth(cb) {
    return onAuthStateChanged(auth, (u) =>
      cb(
        u
          ? {
              uid: u.uid,
              email: u.email,
              name: u.displayName,
              photo: u.photoURL,
            }
          : null,
      ),
    );
  },
  async signInGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    // Popup only: redirect sign-in breaks on Safari, which blocks the storage it relies on.
    await signInWithPopup(auth, provider);
  },
  async sendEmailLink(email, returnUrl) {
    await sendSignInLinkToEmail(auth, email, {
      url: returnUrl,
      handleCodeInApp: true,
    });
  },
  isEmailLink(url) {
    return isSignInWithEmailLink(auth, url);
  },
  async completeEmailLink(email, url) {
    await signInWithEmailLink(auth, email, url);
  },
  async signOut() {
    await fbSignOut(auth);
  },
  async load(uid) {
    const snap = await getDoc(ref(uid));
    return snap.exists() ? toRemote(snap.data()) : null;
  },
  async save(uid, d) {
    await setDoc(ref(uid), {
      data: d.data,
      updatedAt: d.updatedAt,
      deviceId: d.deviceId,
      version: 1,
    });
  },
  async remove(uid) {
    await deleteDoc(ref(uid));
  },
  subscribe(uid, cb) {
    return onSnapshot(ref(uid), (snap) => cb(snap.exists() ? toRemote(snap.data()) : null));
  },
};
