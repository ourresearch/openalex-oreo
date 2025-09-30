<template>
  <v-container class="page">
    <v-row>
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <v-card class="pa-6">
          <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          <div v-else-if="error" class="text-center py-8">
            <v-icon color="error" size="48">mdi-alert-circle</v-icon>
            <p class="text-h6 mt-4">Failed to load changelog</p>
            <p class="text-body-2 text-grey">{{ error }}</p>
          </div>
          <div v-else v-html="renderedMarkdown" class="changelog-content"></div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useHead } from '@unhead/vue';

const loading = ref(true);
const error = ref(null);
const renderedMarkdown = ref('');

useHead({
  title: 'Changelog'
});

onMounted(async () => {
  try {
    const response = await fetch('/CHANGELOG.md');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    renderedMarkdown.value = parseMarkdown(markdown);
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

// Simple markdown parser for basic formatting
function parseMarkdown(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  
  return html;
}
</script>

<style scoped lang="scss">
.changelog-content {
  :deep(h1) {
    font-size: 2rem;
    font-weight: 500;
    margin-bottom: 1rem;
    margin-top: 0;
  }
  
  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 500;
    margin-top: 2rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
  }
  
  :deep(h3) {
    font-size: 1.25rem;
    font-weight: 500;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  :deep(p) {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  
  :deep(ul) {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  :deep(li) {
    margin-bottom: 0.5rem;
  }
  
  :deep(code) {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }
  
  :deep(pre) {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1rem;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  :deep(a) {
    color: #1976d2;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
