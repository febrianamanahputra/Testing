import { useState, useEffect } from 'react';
import { Workspace } from '../types';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError } from '../utils/firestore-error';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser || !auth.currentUser.email) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }

    const email = auth.currentUser.email;

    const q = query(
      collection(db, 'workspaces'),
      where('aclEmails', 'array-contains', email)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const wss = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          ownerId: data.ownerId,
          aclEmails: data.aclEmails,
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
        } as Workspace;
      });

      setWorkspaces(wss);

      // Auto-create default workspace if none exist
      if (wss.length === 0) {
        try {
          const newDocRef = doc(collection(db, 'workspaces'));
          const newWs = {
            name: `${auth.currentUser.displayName || 'My'} Workspace`,
            ownerId: auth.currentUser.uid,
            aclEmails: [email],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(newDocRef, newWs);
          // Snapshot listener will trigger again and populate the array
        } catch (error: any) {
          handleFirestoreError(error, 'create', 'workspaces');
        }
      } else {
        // Set active if none is set or if current active is no longer in the list
        setActiveWorkspace(prev => {
          if (!prev) return wss[0];
          const stillExists = wss.find(w => w.id === prev.id);
          return stillExists || wss[0];
        });
        setLoading(false);
      }
    }, (error) => {
      console.error("Firestore workspace subscription error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return { workspaces, activeWorkspace, setActiveWorkspace, loadingWorkspaces: loading };
}
