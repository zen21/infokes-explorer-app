import { IFileRepository } from '../domain/repositories';

export class FileService {
  constructor(private readonly fileRepository: IFileRepository) {}

  async getFilesByFolderId(folderId: string) {
    return this.fileRepository.findByFolderId(folderId);
  }

  async searchFiles(query: string, page: number = 1, limit: number = 50) {
    return this.fileRepository.search(query, page, limit);
  }
}