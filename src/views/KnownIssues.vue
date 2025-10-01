<template>
  <v-container class="mt-8">
    <v-row>
      <v-col cols="12" md="10" lg="8" xl="6">
        <div class="d-flex align-start justify-space-between mb-8">
          <div>
            <h1 class="text-h3 mb-1">Known Issues</h1>
            <div class="text-grey-darken-3 text-subtitle-1">
              Here's where we're tracking bugs that don't fit into the OREO testing framework.
            </div>
          </div>
          <v-btn
            variant="flat"
            color="black"
            append-icon="mdi-open-in-new"
            @click="handleReportClick"
          >
            Report Issue
          </v-btn>
        </div>
        
        <v-card
          v-for="(issue, index) in issues"
          :key="index"
          variant="outlined"
          class="mb-4 pa-4"
        >
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
            size="x-small"
            class="mr-2"
          >
            {{ tag }}
          </v-chip>
        </v-card>
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

  {
    name: 'New works have no author IDs',
    description: "We've got the author string, but not matched to an Author in the OpenAlex graph yet.",
    tags: ["new works"],
    priority: null,
  },

  {
    name: 'New works have no related works',
    description: "We haven't run the related works algorithm yet.",
    tags: ["new works"],
    priority: null,
  },
]);
</script>

<style scoped>
</style>
