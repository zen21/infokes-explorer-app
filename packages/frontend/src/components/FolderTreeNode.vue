<template>
  <div class="folder-tree-node">
    <!-- Folder Item -->
    <div
      class="flex items-center py-1 px-2 rounded-lg transition-colors cursor-pointer group"
      :class="{
        'bg-blue-50 border border-blue-200': isSelected,
        'hover:bg-gray-100': !isSelected
      }"
      :style="{ marginLeft: `${depth * 16}px` }"
      @click="handleClick"
      @dblclick="handleDoubleClick"
    >
      <!-- Expand/Collapse Button -->
      <button
        v-if="hasChildren"
        @click.stop="handleToggle"
        class="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 mr-1 transition-colors flex-shrink-0"
      >
        <svg
          class="w-3 h-3 transition-transform duration-200"
          :class="{ 'rotate-90': folder.isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div v-else class="w-4 h-4 mr-1 flex-shrink-0"></div>

      <!-- Folder Icon -->
      <div class="w-5 h-5 mr-2 flex items-center justify-center flex-shrink-0">
        <svg
          v-if="hasChildren"
          class="w-4 h-4 transition-colors"
          :class="{
            'text-blue-500': folder.isOpen,
            'text-gray-400': !folder.isOpen
          }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="folder.isOpen 
              ? 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z'
              : 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>

      <!-- Folder Name -->
      <span 
        class="text-sm flex-1 truncate transition-colors"
        :class="{
          'text-blue-700 font-medium': isSelected,
          'text-gray-700 group-hover:text-gray-900': !isSelected
        }"
      >
        {{ folder.name }}
      </span>

      <!-- Folder Stats -->
      <span
        v-if="folder._count"
        class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0"
      >
        {{ folder._count.children }}/{{ folder._count.files }}
      </span>
    </div>

    <!-- Children -->
    <div 
      v-if="folder.isOpen && hasChildren" 
      class="folder-children transition-all duration-200"
    >
      <FolderTreeNode
        v-for="child in folder.children || []"
        :key="child.id"
        :folder="child"
        :depth="depth + 1"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FolderTree } from '@file-explorer/shared';
import { computed } from 'vue';

interface Props {
  folder: FolderTree;
  depth: number;
}

interface Emits {
  (event: 'select', folder: FolderTree): void;
  (event: 'toggle', folder: FolderTree): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hasChildren = computed(() => 
  props.folder.children && props.folder.children.length > 0
);

const isSelected = computed(() => false);

const handleClick = () => {
  emit('select', props.folder);
};

const handleDoubleClick = () => {
  if (hasChildren.value) {
    handleToggle();
  }
};

const handleToggle = (event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  
  if (hasChildren.value) {
    // Hanya emit event dengan folder ID, tidak perlu membuat mutable copy
    emit('toggle', props.folder);
  }
};
</script>