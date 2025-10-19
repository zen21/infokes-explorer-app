export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  name: string;
  folderId: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[];
  _count?: {
    children: number;
    files: number;
  };
}

export interface FolderTree extends FolderWithChildren {
  isOpen?: boolean;
  children?: FolderTree[];
}

// API Request/Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetFolderTreeResponse {
  folders: FolderTree[];
}

export interface GetFolderContentsResponse {
  folders: Folder[];
  files: File[];
  currentFolder: Folder | null;
}

export interface SearchRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  folders: Folder[];
  files: File[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation Schemas
import { z } from 'zod';

export const folderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable(),
  path: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const fileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  folderId: z.string().uuid(),
  size: z.number().int().nonnegative(),
  type: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});