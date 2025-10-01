<template>
  <v-container class="mt-2">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <div class="text-h3 mb-8">Known Issues</div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <ul>
          <li>
            Institution lineages aren't done in Walden, so grouping by institution lineages will return very low numbers.
          </li>
          <li>
            Fulltext indexes aren't fully ported to Walden yet, so fulltext searches will return way fewer resutls.
          </li>
        </ul>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useHead } from '@unhead/vue';

defineOptions({ name: 'KnownIssues' });

useHead({
  title: 'Known Issues'
});
</script>

<style scoped>
</style>
