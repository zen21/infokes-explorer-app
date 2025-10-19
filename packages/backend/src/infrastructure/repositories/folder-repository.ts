import { prisma } from '../../infrastructure/database';
import { IFolderRepository } from '../../core/domain/repositories';
import { FolderEntity } from '../../core/domain/entities';
import type { Folder } from '../../core/domain/entities';

export class FolderRepository implements IFolderRepository {
  async findById(id: string): Promise<FolderEntity | null> {
    const result = await prisma.folder.findUnique({
      where: { id },
    });
    
    if (!result) return null;
    
    return FolderEntity.create(result, result.id);
  }

  async findByPath(path: string): Promise<FolderEntity | null> {
    const result = await prisma.folder.findFirst({
      where: { path },
    });
    
    if (!result) return null;
    
    return FolderEntity.create(result, result.id);
  }

  async findChildren(parentId: string | null): Promise<FolderEntity[]> {
    const results = await prisma.folder.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
    
    return results.map(folder => FolderEntity.create(folder, folder.id));
  }

  async findTree(): Promise<Folder[]> {
    // Get all folders and build tree in memory
    const allFolders = await prisma.folder.findMany({
      orderBy: { name: 'asc' },
    });
    
    return allFolders as Folder[];
  }

  async save(folder: FolderEntity): Promise<FolderEntity> {
    const folderData = {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      path: folder.path,
      createdAt: folder.props.createdAt,
      updatedAt: new Date(),
    };

    const result = await prisma.folder.upsert({
      where: { id: folder.id },
      create: folderData,
      update: folderData,
    });
    
    return FolderEntity.create(result, result.id);
  }

  async delete(id: string): Promise<void> {
    await prisma.folder.delete({
      where: { id },
    });
  }

  async search(query: string, page: number = 1, limit: number = 50): Promise<{ folders: FolderEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [folders, total] = await Promise.all([
      prisma.folder.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { path: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.folder.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { path: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      folders: folders.map(folder => FolderEntity.create(folder, folder.id)),
      total,
    };
  }

  async getFolderStats(folderId: string): Promise<{ children: number; files: number }> {
    const [childrenCount, filesCount] = await Promise.all([
      prisma.folder.count({
        where: { parentId: folderId },
      }),
      prisma.file.count({
        where: { folderId },
      }),
    ]);

    return {
      children: childrenCount,
      files: filesCount,
    };
  }
}