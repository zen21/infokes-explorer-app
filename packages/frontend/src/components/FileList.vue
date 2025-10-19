<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center">
      <button
        v-if="currentFolder && currentFolder.parentId"
        @click="$emit('navigate', currentFolder.parentId)"
        class="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
        aria-label="Go to parent folder"
        title="Back to parent folder"
      >
        <Icon icon="lucide:corner-left-up" width="20" height="20" />
      </button>

      <h3 class="text-lg font-semibold text-gray-800 mb-0 truncate">{{ query ? `Search results for: ${query}` :  currentPath }}</h3>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p class="text-gray-600">Loading contents...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="flex flex-col items-center justify-center h-full py-12">
        <svg class="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 text-lg font-medium mb-2">Error loading contents</p>
        <p class="text-gray-600 text-sm">{{ error }}</p>
      </div>

      <!-- Content Container -->
      <div v-else class="h-full overflow-y-auto p-6">
        <!-- Folders Section -->
        <section v-if="(query ? searchFolders : folders).length > 0" class="mb-8">
          <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        {{ query ? 'Search Folders' : 'Folders' }}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="folder in (query ? searchFolders : folders)"
          :key="folder.id"
          class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
          @click="$emit('select-folder', folder)"
          @dblclick="$emit('open-folder', folder)"
        >
          <div class="flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
            </div>
            <h5 class="font-medium text-gray-900 text-sm mb-1 truncate w-full">{{ folder.name }}</h5>
            <p class="text-xs text-gray-500">
          {{ folder._count?.children || 0 }} folders, {{ folder._count?.files || 0 }} files
            </p>
          </div>
        </div>
          </div>
        </section>

        <!-- Files Section -->
        <section v-if="(query ? searchFiles : files).length > 0" class="mb-8">
          <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        {{ query ? 'Search Files' : 'Files' }}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="file in (query ? searchFiles : files)"
          :key="file.id"
          class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
        >
          <div class="flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
            </div>
            <div class="w-full">
          <h5 class="font-medium text-gray-900 text-sm mb-1 truncate">{{ file.name }}</h5>
          <p class="text-xs text-gray-500">
            {{ formatFileSize(file.size) }}
          </p>
            </div>
          </div>
        </div>
          </div>
        </section>

        <!-- Empty State -->
        <div v-if="(query ? searchFolders : folders).length === 0 && (query ? searchFiles : files).length === 0" class="flex flex-col items-center justify-center py-16 text-gray-500">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">
        {{ query ? 'No search results' : 'This folder is empty' }}
          </h4>
          <p class="text-gray-600">
        {{ query ? 'No files or folders match your search.' : 'No files or folders found in this location.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Folder, File, FolderWithChildren } from '@file-explorer/shared';
import { computed } from 'vue';
import { Icon } from "@iconify/vue";

interface Props {
  folders: readonly FolderWithChildren[];
  files: readonly File[];
  currentPath: string;
  currentFolder: Folder | null;
  isLoading: boolean;
  error: string | null;
  query: string;
  searchFolders: readonly FolderWithChildren[];
  searchFiles: readonly File[];
}

interface Emits {
  (event: 'select-folder', folder: Folder): void;
  (event: 'open-folder', folder: Folder): void;
  (event: 'navigate', folderId: string | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hasError = computed(() => props.error !== null);

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>