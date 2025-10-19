import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { FolderRepository } from '../infrastructure/repositories/folder-repository';
import { FileRepository } from '../infrastructure/repositories/file-repository';
import { FolderService } from '../core/services/folder-service';
import { FileService } from '../core/services/file-service';
import { FolderController } from './controllers/folder-controller';

// Dependency Injection Setup
const folderRepository = new FolderRepository();
const fileRepository = new FileRepository();
const folderService = new FolderService(folderRepository);
const fileService = new FileService(fileRepository);
const folderController = new FolderController(folderService, fileService);

export const createApp = () => {
  const app = new Elysia()
    .use(cors())
    .use(swagger({
      documentation: {
        info: {
          title: 'File Explorer API',
          version: '1.0.0',
          description: 'A Windows Explorer-like API for managing files and folders',
        },
        tags: [
          { name: 'Folders', description: 'Folder management endpoints' },
          { name: 'Files', description: 'File management endpoints' }
        ]
      }
    }))
    .get('/', () => ({ message: 'File Explorer API' }))
    .use(folderController.routes)
    .onError(({ code, error, set }) => {
      console.error('API Error:', error);
      const status = code === 'NOT_FOUND' ? 404 : 500;
      set.status = status;
      return new Response(
        JSON.stringify({
          success: false,
          error: code || 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : String(error),
        }),
        {
          status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

  return app;
};