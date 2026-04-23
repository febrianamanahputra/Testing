import { useState, useEffect } from 'react';
import { Material, MaterialHistory, MaterialStatus } from '../types';

const STORAGE_KEY = 'material_tracking_data';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load materials', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  }, [materials]);

  const addMaterial = (
    name: string,
    sku: string,
    category: string,
    initialLocation: string,
    initialStatus: MaterialStatus
  ) => {
    const newMaterial: Material = {
      id: crypto.randomUUID(),
      name,
      sku,
      category,
      currentLocation: initialLocation,
      status: initialStatus,
      history: [
        {
          id: crypto.randomUUID(),
          location: initialLocation,
          timestamp: new Date().toISOString(),
          note: 'Material ditambahkan ke sistem',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const updateLocation = (
    id: string,
    newLocation: string,
    newStatus: MaterialStatus,
    note?: string
  ) => {
    setMaterials((prev) =>
      prev.map((material) => {
        if (material.id === id) {
          const newHistory: MaterialHistory = {
            id: crypto.randomUUID(),
            location: newLocation,
            timestamp: new Date().toISOString(),
            note: note || `Lokasi diubah menjadi ${newLocation}`,
          };
          return {
            ...material,
            currentLocation: newLocation,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            history: [newHistory, ...material.history],
          };
        }
        return material;
      })
    );
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return { materials, addMaterial, updateLocation, deleteMaterial };
}
