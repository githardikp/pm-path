export interface CloudUser {
  uid: string;
  email: string | null;
  name: string | null;
  photo: string | null;
}

/** What is stored per user in the cloud. `data` is the progress JSON as a string. */
export interface RemoteDoc {
  data: string;
  updatedAt: number;
  deviceId: string;
}

export interface CloudBackend {
  onAuth(cb: (u: CloudUser | null) => void): () => void;
  signInGoogle(): Promise<void>;
  sendEmailLink(email: string, returnUrl: string): Promise<void>;
  isEmailLink(url: string): boolean;
  completeEmailLink(email: string, url: string): Promise<void>;
  signOut(): Promise<void>;
  load(uid: string): Promise<RemoteDoc | null>;
  save(uid: string, doc: RemoteDoc): Promise<void>;
  remove(uid: string): Promise<void>;
  subscribe(uid: string, cb: (d: RemoteDoc | null) => void): () => void;
}
