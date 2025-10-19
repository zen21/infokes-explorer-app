import { prisma } from '../../infrastructure/database';
import { IFileRepository } from '../../core/domain/repositories';
import { FileEntity } from '../../core/domain/entities';

export class FileRepository implements IFileRepository {
  async findById(id: string): Promise<FileEntity | null> {
    const result = await prisma.file.findUnique({
      where: { id },
    });
    
    if (!result) return null;
    
    return FileEntity.create(result, result.id);
  }

  async findByFolderId(folderId: string): Promise<FileEntity[]> {
    const results = await prisma.file.findMany({
      where: { folderId },
      orderBy: { name: 'asc' },
    });
    
    return results.map(file => FileEntity.create(file, file.id));
  }

  async save(file: FileEntity): Promise<FileEntity> {
    const fileData = {
      id: file.id,
      name: file.name,
      folderId: file.folderId,
      size: file.size,
      type: file.type,
      createdAt: file.props.createdAt,
      updatedAt: new Date(),
    };

    const result = await prisma.file.upsert({
      where: { id: file.id },
      create: fileData,
      update: fileData,
    });
    
    return FileEntity.create(result, result.id);
  }

  async delete(id: string): Promise<void> {
    await prisma.file.delete({
      where: { id },
    });
  }

  async search(query: string, page: number = 1, limit: number = 50): Promise<{ files: FileEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { type: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.file.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { type: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      files: files.map(file => FileEntity.create(file, file.id)),
      total,
    };
  }
}