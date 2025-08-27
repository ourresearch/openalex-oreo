<template>
  <div v-if="data" class="w-100">
    <div class="mb-0" style="font-size: 18px; cursor: pointer;" @click="emit('title-click', id)">
      <span v-if="data.title" :class="isCompare && !matches['title_changed'] ? 'text-red-lighten-2' : ''">
        {{ data.title }}
      </span>
      <span v-else class="text-red-lighten-2">Title Missing</span>
    </div>

    <!--Authors-->
    <div class="authors-line text-grey-darken-2" style="line-height: 1;">
      <template v-if="data.authorships && data.authorships.length">
        <span 
          v-for="(authorship, index) in data.authorships" :key="authorship.id"
          class="text-caption mr-1"
          style="font-size: 14px !important;"
        >
        {{ authorship.raw_author_name }}{{ index < data.authorships.length - 1 ? ',' : '' }}
        </span>
      </template>
      <template v-else>
        <span class="text-caption mr-1 text-red-lighten-2" style="font-size: 14px !important;">Authors Missing</span>
      </template>
    </div>

    <!--Publication Year, Type, Source-->
    <div class="text-caption text-grey-darken-2" style="font-size: 14px !important;">

      <span :class="isCompare && !matches['oa_status_changed'] ? 'text-red-lighten-2' : 'text-grey-lighten-1'">
        <v-tooltip :text="data.open_access?.oa_status" location="bottom">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" v-if="data.open_access?.oa_status === 'closed'" size="x-small" icon="mdi-lock"></v-icon>
            <v-icon v-bind="props" v-else size="x-small" icon="mdi-lock-open-outline"></v-icon>
          </template>
        </v-tooltip>
      </span>
      <span class="mx-1">•</span>

      <span :class="isCompare && !matches['publication_year_changed'] ? 'text-red-lighten-2' : ''">
        {{ data.publication_year }}
      </span>
      <span class="mx-1">•</span>
      <span :class="isCompare && !matches['type_changed'] ? 'text-red-lighten-2' : ''">
        {{ data.type }}
      </span>
      <span class="mx-1">•</span>
      <template v-if="data.primary_location?.source?.display_name">
        <span :class="isCompare && !matches['source_id_lost'] ? 'text-red-lighten-2' : (isCompare && matches['source_id_added'] ? 'text-green-lighten-2' : '')">
          {{ data.primary_location.source?.display_name }}
        </span> 
        <span v-if="!data.primary_location.source?.id" class="text-red-lighten-2 ml-1">- Source ID Missing</span>
      </template>
      <template v-else>
        <span class="text-red-lighten-2">Source Missing</span>
      </template>
    </div>
  </div>
  <div v-else>
    <div class="mb-0" style="font-size: 18px;">
      <span class="text-grey-darken-2">-</span>
    </div>
  </div>
</template>

<script setup>

import { computed } from 'vue';

defineOptions({ name: 'GoogleScholarView' });

const { id, data, matches, compareData } = defineProps({
  id: String,
  data: Object,
  matches: null,
  compareData: null,
});

const emit = defineEmits(['title-click']);

const isCompare = computed(() => !!compareData && !!matches);

</script>

<style scoped>
.authors-line {
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
