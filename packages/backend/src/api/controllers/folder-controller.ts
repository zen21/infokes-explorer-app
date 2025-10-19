import { Elysia, t } from 'elysia';
import { FolderService } from '../../core/services/folder-service';
import { FileService } from '../../core/services/file-service';

export class FolderController {
  constructor(
    private readonly folderService: FolderService,
    private readonly fileService: FileService
  ) {}

  get routes() {
    return new Elysia({ prefix: '/v1/folders' })
      .get('/', async () => {
        try {
          return await this.getFolderTree();
        } catch (error: any) {
          console.error('Controller /v1/folders error:', error);
          return {
            error: 'INTERNAL_SERVER_ERROR',
            message: error.message
          };
        }
      }, {
        detail: { tags: ['Folders'], description: 'Get complete folder tree' }
      })
      .get('/:id/contents', async ({ params: { id } }) => await this.getFolderContents(id), {
        params: t.Object({
          id: t.Union([t.String(), t.Literal('root')])
        }),
        detail: { tags: ['Folders'], description: 'Get folder contents' }
      })
      .get('/search', async ({ query }) =>
        await this.searchFolders(query.q, parseInt(query.page ?? '1') || 1, parseInt(query.limit ?? '50') || 50), {
          query: t.Object({
            q: t.String({ minLength: 1 }),
            page: t.Optional(t.String()),
            limit: t.Optional(t.String())
          }),
          detail: { tags: ['Folders'], description: 'Search folders' }
        })
      .onError(({ error, set }) => {
        console.error('Controller error:', error);
        set.status = 500;
        return new Response(
          JSON.stringify({
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });
  }

  private async getFolderTree() {
    const folders = await this.folderService.getFolderTree();
    return {
      data: { folders },
      message: 'Folder tree retrieved successfully'
    };
  }

  private async getFolderContents(id: string) {
    const folderId = id === 'root' ? null : id;
    const contents = await this.folderService.getFolderContents(folderId);

    if (folderId) {
      const files = await this.fileService.getFilesByFolderId(folderId);
      contents.files = files.map(file => file.props);
    }

    return {
      data: contents,
      message: 'Folder contents retrieved successfully'
    };
  }

  private async searchFolders(query: string, page: number, limit: number) {
    const [folderResult, fileResult] = await Promise.all([
      this.folderService.searchFolders(query, page, limit),
      this.fileService.searchFiles(query, page, limit)
    ]);

    return {
      data: {
        folders: folderResult.folders.map(folder => folder.props),
        files: fileResult.files.map(file => file.props),
        pagination: {
          page,
          limit,
          total: folderResult.total + fileResult.total,
          totalPages: Math.ceil((folderResult.total + fileResult.total) / limit)
        }
      },
      message: 'Search completed successfully'
    };
  }
}