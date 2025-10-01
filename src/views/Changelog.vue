<template>
  <v-container class="mt-8">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <h1 class="text-h1 mb-8">Changelog</h1>
        
        <p>All notable changes to this project will be documented here.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useHead } from '@unhead/vue';

defineOptions({ name: 'Changelog' });

useHead({
  title: 'Changelog'
});
</script>

<style scoped>
</style>
