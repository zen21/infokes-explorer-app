import { FolderEntity, FileEntity } from './entities';
import { Folder, File } from '@file-explorer/shared';

export interface IFolderRepository {
  findById(id: string): Promise<FolderEntity | null>;
  findByPath(path: string): Promise<FolderEntity | null>;
  findChildren(parentId: string | null): Promise<FolderEntity[]>;
  findTree(): Promise<Folder[]>;
  save(folder: FolderEntity): Promise<FolderEntity>;
  delete(id: string): Promise<void>;
  search(query: string, page: number, limit: number): Promise<{ folders: FolderEntity[]; total: number }>;
  getFolderStats(folderId: string): Promise<{ children: number; files: number }>;
}

export interface IFileRepository {
  findById(id: string): Promise<FileEntity | null>;
  findByFolderId(folderId: string): Promise<FileEntity[]>;
  save(file: FileEntity): Promise<FileEntity>;
  delete(id: string): Promise<void>;
  search(query: string, page: number, limit: number): Promise<{ files: FileEntity[]; total: number }>;
}