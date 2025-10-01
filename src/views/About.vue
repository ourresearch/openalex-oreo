<template>
  <v-container class="mt-2">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <div class="-8">Welcome to <span class="font-weight-bold">OREO:</span> the OpenAlex rewrite eval overview.</div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <p>This tool helps you track data changes in OpenAlex as we <a href="https://blog.openalex.org/were-rebuilding-openalex-while-its-running-heres-whats-changing/" target="_blank">roll out our rewritten codebase</a> (codenamed <a href="https://www.reddit.com/r/minimalism/comments/3h7ot4/a_passage_from_henry_david_thoreaus_walden/" target="_blank">Walden</a>) throughout October 2025.</p>

        <p>OREO compares Classic (the old dataset) with Walden data. It highlights where entities (works, authors, sources, etc) have changed--for better or for worse.</p>

        <p>We don't focus much on the 100M+ new works added in Walden yet (codenamed xpac), because those are less likely to break existing integrations--but you can <a href="https://openalex.org/works?page=1&filter=is_xpac:true&v2=true" target="_blank">view those works in the OpenAlex UI</a>, and view known issues here in OREO.</p>

        <p>You can check out Walden data directly in the OpenAlex UI (click the <a href="https://openalex.org/works?v2=true" target="_blank"><v-icon icon="mdi-test-tube" size="small"></v-icon></a> icon in the top-right) or the API (add <code>data-version=2</code> to your API requests <a href="https://api.openalex.org/works?data-version=2" target="_blank">like this</a>).</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useHead } from '@unhead/vue';

defineOptions({ name: 'About' });

useHead({
  title: 'About'
});
</script>

<style scoped>
</style>
