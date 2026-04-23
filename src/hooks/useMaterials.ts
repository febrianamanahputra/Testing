import { useState, useEffect } from 'react';
import { Material, MaterialStatus, Workspace } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, query, where, onSnapshot, 
  doc, setDoc, deleteDoc, serverTimestamp, writeBatch 
} from 'firebase/firestore';
import { handleFirestoreError } from '../utils/firestore-error';

export function useMaterials(activeWorkspace: Workspace | null) {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    if (!auth.currentUser || !activeWorkspace || !auth.currentUser.email) {
      setMaterials([]);
      return;
    }

    const email = auth.currentUser.email;

    // Based on the rules, we query simply by workspaceId to avoid the N-reads amplification,
    // and let the backend rule (resource.data.aclEmails array-contains) filter.
    // However, older Firebase requires you to query by the indexed field that the rule uses.
    // In our rule: allow list: if isSignedIn() && resource.data.aclEmails.hasAny([request.auth.token.email]);
    // So we must query where aclEmails array-contains email, AND filter by workspaceId locally.
    
    const q = query(
      collection(db, 'materials'),
      where('aclEmails', 'array-contains', email),
      where('workspaceId', '==', activeWorkspace.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          sku: data.sku,
          category: data.category,
          currentLocation: data.currentLocation,
          status: data.status,
          workspaceId: data.workspaceId,
          createdBy: data.createdBy,
          aclEmails: data.aclEmails,
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
        } as Material;
      });
      // Sort by updatedAt descending
      ms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setMaterials(ms);
    }, (error) => {
      console.error("Firestore subscription error:", error);
      handleFirestoreError(error, 'list', 'materials');
    });

    return () => unsubscribe();
  }, [activeWorkspace]);

  const addMaterial = async (
    name: string,
    sku: string,
    category: string,
    initialLocation: string,
    initialStatus: MaterialStatus
  ) => {
    if (!auth.currentUser || !activeWorkspace) return;
    try {
      const batch = writeBatch(db);
      
      const materialRef = doc(collection(db, 'materials'));
      batch.set(materialRef, {
        name,
        sku,
        category,
        currentLocation: initialLocation,
        status: initialStatus,
        workspaceId: activeWorkspace.id,
        aclEmails: activeWorkspace.aclEmails,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const historyRef = doc(collection(db, 'materials', materialRef.id, 'history'));
      batch.set(historyRef, {
        location: initialLocation,
        status: initialStatus,
        note: 'Material ditambahkan ke sistem',
        createdBy: auth.currentUser.uid,
        aclEmails: activeWorkspace.aclEmails,
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (error: any) {
      handleFirestoreError(error, 'create', 'materials');
    }
  };

  const updateLocation = async (
    id: string,
    newLocation: string,
    newStatus: MaterialStatus,
    note?: string
  ) => {
    if (!auth.currentUser || !activeWorkspace) return;
    try {
      const batch = writeBatch(db);
      
      const materialRef = doc(db, 'materials', id);
      const material = materials.find(m => m.id === id);
      if(!material) throw new Error("Material not found");

      batch.set(materialRef, {
        name: material.name,
        sku: material.sku,
        category: material.category,
        currentLocation: newLocation,
        status: newStatus,
        workspaceId: material.workspaceId,
        aclEmails: material.aclEmails,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const historyRef = doc(collection(db, 'materials', id, 'history'));
      batch.set(historyRef, {
        location: newLocation,
        status: newStatus,
        note: note || `Lokasi diubah menjadi ${newLocation}`,
        createdBy: auth.currentUser.uid,
        aclEmails: material.aclEmails,
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (error: any) {
      handleFirestoreError(error, 'update', `materials/${id}`);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'materials', id));
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `materials/${id}`);
    }
  };

  return { materials, addMaterial, updateLocation, deleteMaterial };
}
