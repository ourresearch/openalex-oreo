<template>
  <v-container class="mt-8">
    <v-row>
      <v-col cols="12" md="10" lg="8" xl="6">
        <div class="d-flex align-center justify-space-between mb-8">
          <h1 class="text-h3 mb-0">Known Issues</h1>
          <v-btn
            variant="flat"
            color="black"
            append-icon="mdi-open-in-new"
            @click="handleReportClick"
          >
            Report Issue
          </v-btn>
        </div>
        
        <div v-for="(issue, index) in issues" :key="index" class="mb-6">
          <div class="mb-2">
            <span class="font-weight-bold">{{ issue.name }}</span>
          </div>
          <div class="mb-2">
            {{ issue.description }}
          </div>
          <v-chip 
            v-for="tag in issue.tags"
            :key="tag"
            label
            color="grey"
            variant="outlined"
            size="small"
            class="mr-2"
          >
            {{ tag }}
          </v-chip>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useHead } from '@unhead/vue';

defineOptions({ name: 'KnownIssues' });

useHead({
  title: 'Known Issues'
});

const handleReportClick = (event) => {
  if (event.metaKey || event.ctrlKey) {
    // Command/Ctrl+click: Go to GitHub
    window.open('https://github.com/ourresearch/openalex-oreo/blob/main/src/views/KnownIssues.vue', '_blank');
  } else {
    // Regular click: Go to help form
    window.open('https://help.openalex.org/hc/en-us/requests/new', '_blank');
  }
};

const issues = ref([
  {
    name: 'Institution grouping works poorly',
    description: 'Institution lineages aren\'t done in Walden, so grouping by institution lineages will return very low numbers.',
    tags: ["old works", "new works"],
    priority: null,
  },
  {
    name: 'Fulltext search incomplete',
    description: 'Fulltext indexes aren\'t fully ported to Walden yet, so fulltext searches will return way fewer results.',
    tags: ["old works", "new works"],
    priority: null,
  },
  {
    name: 'Authors missing from OREO',
    description: "You can't analyze authors in OREO yet.",
    tags: ["oreo"],
    priority: null,
  },
]);
</script>

<style scoped>
</style>
