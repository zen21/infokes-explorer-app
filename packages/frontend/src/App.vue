<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-gray-800 text-white shadow-lg z-10">
      <div class="px-6 py-4">
        <h1 class="text-xl font-semibold">File Explorer</h1>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Panel dengan border full height -->
      <div class="relative w-80 min-w-64 max-w-96 bg-white">
        <div class="absolute inset-y-0 right-0 w-px z-10"></div>
        <FolderTree
          :folder-tree="state.folderTree"
          :is-loading="isLoading"
          :error="state.error"
          :search-query="searchQuery"
          :search-results="state.searchResults"
          @select="handleSelectFolder"
          @toggle="handleToggleFolder"
          @search="handleSearch"
          @clear-search="handleClear"
          @update:searchQuery="handleSearchQueryUpdate"
        />
      </div>
      
      <!-- Right Panel -->
      <div class="flex-1 h-full min-w-0 bg-white">
        <FileList
          :folders="state.currentContents.folders"
          :files="state.currentContents.files"
          :current-path="currentPath"
          :current-folder="state.currentFolder"
          :is-loading="isLoading"
          :error="state.error"
          :query="state.searchResults.query"
          :search-folders="state.searchResults.folders"
          :search-files="state.searchResults.files"
          @select-folder="handleSelectFolderFromList"
          @open-folder="handleOpenFolder"
          @navigate="handleNavigate"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import FolderTree from './components/FolderTree.vue';
import FileList from './components/FileList.vue';
import { useExplorer } from './composables/useExplorer';
import type { FolderWithChildren, FolderTree as IFolderTree } from '@file-explorer/shared';

const {
  state,
  searchQuery,
  isLoading,
  hasError,
  currentPath,
  selectFolder,
  toggleFolder,
  search,
  clearSearch,
  loadFolderContents,
} = useExplorer();

const handleSelectFolder = (folder: IFolderTree) => {
  clearSearch();
  selectFolder(folder);
};

const handleToggleFolder = (folder: IFolderTree) => {
  toggleFolder(folder);
};

const handleSelectFolderFromList = (folder: FolderWithChildren) => {
  clearSearch();
  selectFolder(folder as IFolderTree);
};

const handleOpenFolder = (folder: FolderWithChildren) => {
  clearSearch();
  selectFolder(folder as IFolderTree);
};

const handleNavigate = (folderId: string | null) => {
  clearSearch();
  loadFolderContents(folderId);
};

const handleSearch = (query: string) => {
  search(query);
};

const handleClear = () => {
  clearSearch();
};

const handleSearchQueryUpdate = (query: string) => {
  searchQuery.value = query;
};

onMounted(() => {
  // Initial load will be handled by the composable
});
</script>