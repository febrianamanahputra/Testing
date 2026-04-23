export interface MaterialHistory {
  id: string;
  location: string;
  timestamp: string;
  note?: string;
}

export type MaterialStatus = 'Tersedia' | 'Dalam Perjalanan' | 'Sedang Digunakan' | 'Dalam Perbaikan' | 'Hilang/Rusak';

export interface Material {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentLocation: string;
  status: MaterialStatus;
  history: MaterialHistory[];
  createdAt: string;
  updatedAt: string;
}
