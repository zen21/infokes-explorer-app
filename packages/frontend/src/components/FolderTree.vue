<template>
  <div class="h-full flex flex-col border-r border-gray-200 bg-gray-50">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <div class="relative">
        <input
          v-model="localSearchQuery"
          type="text"
          placeholder="Search file & folders..."
          @input="handleSearch"
          class="w-full px-3 py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
        />
        <div class="absolute right-3 top-2.5">
          <Icon
            :icon="localSearchQuery ? 'lucide:x' : 'lucide:search'"
            width="16"
            height="16"
            :class="['w-4 h-4 cursor-pointer', localSearchQuery ? 'text-black' : 'text-gray-400']"
            @click="localSearchQuery && handleClear()"
          />
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
        <p class="text-gray-600 text-sm">Loading folders...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="hasError" class="flex flex-col items-center justify-center h-full py-8 px-4">
        <svg class="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 text-sm text-center">{{ error }}</p>
      </div>
      
      <!-- Search Results -->
      <div v-else-if="localSearchQuery" class="h-full overflow-y-auto p-2">
        <div class="mb-4 px-2">
          <p class="text-sm text-gray-600">
            Search results for: "<span class="font-medium">{{ localSearchQuery }}</span>"
          </p>
          <button
            @click="handleClear"
            class="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            Clear search
          </button>
        </div>
        
        <!-- Search Results Folders -->
        <div v-if="searchResults.folders.length > 0">
          <FolderTreeNode
            v-for="folder in searchResults.folders"
            :key="folder.id"
            :folder="folder"
            :depth="0"
            @select="handleSelectFromSearch"
            @toggle="handleToggle"
          />
        </div>
        
        <!-- No Search Results -->
        <div v-else class="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-sm">No folders found for "{{ localSearchQuery }}"</p>
        </div>
      </div>
      
      <!-- Normal Folder Tree -->
      <div v-else class="h-full overflow-y-auto p-2">
        <FolderTreeNode
          v-for="folder in folderTree"
          :key="folder.id"
          :folder="folder"
          :depth="0"
          @select="handleSelect"
          @toggle="handleToggle"
        />
        
        <!-- Empty State -->
        <div v-if="folderTree.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p class="text-sm">No folders found</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import FolderTreeNode from './FolderTreeNode.vue';
import type { FolderTree } from '@file-explorer/shared';
import { Icon } from "@iconify/vue";

interface Props {
  folderTree: readonly FolderTree[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string; // Terima searchQuery dari parent
  searchResults: {
    folders: readonly FolderTree[];
    files: readonly any[];
    query: string;
  };
}

interface Emits {
  (event: 'select', folder: FolderTree): void;
  (event: 'toggle', folder: FolderTree): void;
  (event: 'search', query: string): void;
  (event: 'clear'): void;
  (event: 'update:searchQuery', query: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local search query yang sync dengan prop dari useExplorer
const localSearchQuery = ref(props.searchQuery);

const hasError = computed(() => props.error !== null);

const searchTimeout = ref<number>();

// Sync localSearchQuery dengan prop dari parent
watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue;
});

// Emit perubahan search query ke parent
watch(localSearchQuery, (newQuery) => {
  emit('update:searchQuery', newQuery);
});

const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    emit('search', localSearchQuery.value);
  }, 300);
};

const handleSelect = (folder: FolderTree) => {
  emit('select', folder);
};

const handleSelectFromSearch = (folder: FolderTree) => {
  // Clear search ketika memilih folder dari hasil pencarian
  handleClear();
  emit('select', folder);
};

const handleToggle = (folder: FolderTree) => {
  emit('toggle', folder);
};

const handleClear = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = undefined;
  }
  localSearchQuery.value = '';
  emit('clear');
};
</script>