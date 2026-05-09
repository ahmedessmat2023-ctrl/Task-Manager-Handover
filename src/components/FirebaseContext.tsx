import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  setDoc,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Task, Handover, User as AppUser, Status, Office } from '../types';

interface FirebaseContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  tasks: Task[];
  handovers: Handover[];
  offices: Office[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  // Validate connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync/Fetch AppUser profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setAppUser(userSnap.data() as AppUser);
        } else {
          const newUser: AppUser = {
            name: firebaseUser.displayName || 'Anonymous',
            role: 'Operations Lead',
            office: 'Cairo Hub',
            country: 'Egypt',
            email: firebaseUser.email || ''
          };
          await setDoc(userRef, newUser);
          setAppUser(newUser);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setHandovers([]);
      return;
    }

    const tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
      setTasks(taskList);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'tasks');
    });

    const handoversQuery = query(collection(db, 'handovers'), orderBy('createdAt', 'desc'));
    const unsubscribeHandovers = onSnapshot(handoversQuery, (snapshot) => {
      const handoverList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Handover));
      setHandovers(handoverList);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'handovers');
    });

    const officesQuery = query(collection(db, 'offices'), orderBy('name', 'asc'));
    const unsubscribeOffices = onSnapshot(officesQuery, (snapshot) => {
      const officeList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Office));
      setOffices(officeList);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'offices');
    });

    return () => {
      unsubscribeTasks();
      unsubscribeHandovers();
      unsubscribeOffices();
    };
  }, [user]);

  const login = async () => {
    if (isAuthProcessing) return;
    setIsAuthProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error('Login failed:', error);
      }
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider value={{ user, appUser, loading, tasks, handovers, offices, login, logout, isReady }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

// Error Handler helper
function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the app, but log it clearly
}
