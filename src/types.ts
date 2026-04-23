export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  aclEmails: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MaterialHistory {
  id: string;
  location: string;
  timestamp: string;
  note?: string;
  status?: string;
  createdBy?: string;
  aclEmails?: string[];
}

export type MaterialStatus = 'Tersedia' | 'Dalam Perjalanan' | 'Sedang Digunakan' | 'Dalam Perbaikan' | 'Hilang/Rusak';

export interface Material {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentLocation: string;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
  workspaceId?: string;
  createdBy?: string;
  aclEmails?: string[];
}

