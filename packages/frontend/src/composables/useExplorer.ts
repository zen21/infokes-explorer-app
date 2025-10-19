import { ref, computed, reactive, watch } from 'vue';
import { explorerApi } from '../services/api';
import type { ExplorerState } from '../types/api';
import type { FolderTree } from '@file-explorer/shared';

export function useExplorer() {
  const state = reactive<ExplorerState>({
    folderTree: [],
    currentFolder: null,
    currentContents: {
      folders: [],
      files: [],
    },
    selectedFolder: null,
    searchResults: {
      folders: [],
      files: [],
      query: '',
    },
    loading: false,
    error: null,
  });

  // Tambahkan ref untuk searchQuery
  const searchQuery = ref('');

  // Computed
  const isLoading = computed(() => state.loading);
  const hasError = computed(() => state.error !== null);
  const currentPath = computed(() => {
    if (!state.currentFolder) return '/';
    return state.currentFolder.path;
  });

  // Watch searchQuery changes dan sync dengan searchResults.query
  watch(searchQuery, (newQuery) => {
    if (!newQuery.trim()) {
      // Jika searchQuery kosong, clear search results
      clearSearch();
    } else {
      // Jika ada query, update searchResults.query
      state.searchResults.query = newQuery;
    }
  });

  // Methods
  const setLoading = (loading: boolean) => {
    state.loading = loading;
  };

  const setError = (error: string | null) => {
    state.error = error;
  };

  const loadFolderTree = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await explorerApi.getFolderTree();
      state.folderTree = response.folders as FolderTree[];
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load folder tree');
      console.error('Error loading folder tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderId: string | null): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await explorerApi.getFolderContents(folderId);
      state.currentFolder = response.currentFolder;
      state.currentContents = {
        folders: response.folders,
        files: response.files,
      };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load folder contents');
      console.error('Error loading folder contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectFolder = async (folder: FolderTree): Promise<void> => {
    state.selectedFolder = folder;
    await loadFolderContents(folder.id);
  };

  const toggleFolder = (folder: FolderTree): void => {
    // Fungsi rekursif untuk toggle folder
    const toggleFolderInTree = (folders: FolderTree[], folderId: string): FolderTree[] => {
      return folders.map(f => {
        if (f.id === folderId) {
          return {
            ...f,
            isOpen: !f.isOpen
          };
        }
        if (f.children && f.children.length > 0) {
          return {
            ...f,
            children: toggleFolderInTree(f.children, folderId)
          };
        }
        return f;
      });
    };

    state.folderTree = toggleFolderInTree(state.folderTree as FolderTree[], folder.id);
  };

  const search = async (query: string): Promise<void> => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await explorerApi.search(query);
      state.searchResults = {
        folders: response.folders,
        files: response.files,
        query,
      };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = (): void => {
    state.searchResults = { folders: [], files: [], query: '' };
    searchQuery.value = ''; // Clear searchQuery
    // Tidak perlu memanggil loadFolderContents(null) di sini karena akan mengganggu state current folder
  };

  // Initialize
  loadFolderTree();
  loadFolderContents(null);

  return {
    // State
    state,
    searchQuery, // Export searchQuery
    
    // Computed
    isLoading,
    hasError,
    currentPath,

    // Methods
    loadFolderTree,
    loadFolderContents,
    selectFolder,
    toggleFolder,
    search,
    clearSearch,
  };
}