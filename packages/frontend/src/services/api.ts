import axios from 'axios';
import type { 
  ApiResponse, 
  GetFolderTreeResponse, 
  GetFolderContentsResponse,
  SearchResponse 
} from '@file-explorer/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ExplorerApiService {
  async getFolderTree(): Promise<GetFolderTreeResponse> {
    const response = await apiClient.get<ApiResponse<GetFolderTreeResponse>>('/v1/folders');
    return response.data.data;
  }

  async getFolderContents(folderId: string | null): Promise<GetFolderContentsResponse> {
    const id = folderId || 'root';
    const response = await apiClient.get<ApiResponse<GetFolderContentsResponse>>(`/v1/folders/${id}/contents`);
    return response.data.data;
  }

  async search(query: string, page: number = 1, limit: number = 50): Promise<SearchResponse> {
    const response = await apiClient.get<ApiResponse<SearchResponse>>('/v1/folders/search', {
      params: { q: query, page, limit }
    });
    return response.data.data;
  }
}

export const explorerApi = new ExplorerApiService();