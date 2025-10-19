import type { 
  Folder, 
  File, 
  FolderTree, 
  ApiResponse, 
  GetFolderTreeResponse, 
  GetFolderContentsResponse,
  SearchResponse 
} from '@file-explorer/shared';

export interface ExplorerState {
  folderTree: FolderTree[];
  currentFolder: Folder | null;
  currentContents: {
    folders: Folder[];
    files: File[];
  };
  selectedFolder: FolderTree | null;
  searchResults: {
    folders: Folder[];
    files: File[];
    query: string;
  };
  loading: boolean;
  error: string | null;
}