import { IFolderRepository } from '../domain/repositories';
import { FolderTree } from '@file-explorer/shared';

export class FolderService {
  constructor(private readonly folderRepository: IFolderRepository) {}

  async getFolderTree(): Promise<FolderTree[]> {
    try {
      const flatFolders = await this.folderRepository.findTree();
      return this.buildTree(flatFolders);
    } catch (error) {
      console.error('Error in FolderService.getFolderTree:', error);
      throw new Error('Failed to retrieve folder tree');
    }
  }

  async getFolderContents(folderId: string | null): Promise<any> {
    try {
      const [children, currentFolder] = await Promise.all([
        this.folderRepository.findChildren(folderId),
        folderId ? this.folderRepository.findById(folderId) : Promise.resolve(null),
      ]);

      // Get stats for each folder
      const foldersWithStats = await Promise.all(
        children.map(async (folder) => {
          try {
            const stats = await this.folderRepository.getFolderStats(folder.id);
            return {
              ...folder.props,
              _count: stats,
            };
          } catch (error) {
            console.error(`Error getting stats for folder ${folder.id}:`, error);
            return {
              ...folder.props,
              _count: { children: 0, files: 0 },
            };
          }
        })
      );

      return {
        folders: foldersWithStats,
        files: [], // Files will be handled by FileService
        currentFolder: currentFolder?.props || null,
      };
    } catch (error) {
      console.error('Error in FolderService.getFolderContents:', error);
      throw new Error('Failed to retrieve folder contents');
    }
  }

  async searchFolders(query: string, page: number = 1, limit: number = 50) {
    try {
      return await this.folderRepository.search(query, page, limit);
    } catch (error) {
      console.error('Error in FolderService.searchFolders:', error);
      throw new Error('Search failed');
    }
  }

  private buildTree(flatFolders: any[], parentId: string | null = null): FolderTree[] {
    try {
      return flatFolders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          isOpen: false,
          children: this.buildTree(flatFolders, folder.id),
        }));
    } catch (error) {
      console.error('Error building folder tree:', error);
      return [];
    }
  }
}