<template>
  <div v-if="data" class="w-100">
    <template v-if="entityType === 'works'">
      <div class="mb-0" style="font-size: 18px; cursor: pointer;" @click="emit('title-click', id)">
        <span v-if="data.title" :class="isCompare && matches['title_changed'] ? 'text-red-lighten-2' : ''">
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

        <span :class="isCompare && matches['oa_status_changed'] ? 'text-red-lighten-2' : 'text-grey-lighten-1'">
          <v-tooltip :text="data.open_access?.oa_status" location="bottom">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" v-if="data.open_access?.oa_status === 'closed'" size="x-small" icon="mdi-lock"></v-icon>
              <v-icon v-bind="props" v-else size="x-small" icon="mdi-lock-open-variant-outline"></v-icon>
            </template>
          </v-tooltip>
        </span>
        <span class="mx-1">•</span>

        <span :class="isCompare && matches['publication_year_changed'] ? 'text-red-lighten-2' : ''">
          {{ data.publication_year }}
        </span>
        <span class="mx-1">•</span>
        <span :class="isCompare && matches['type_changed'] ? 'text-red-lighten-2' : ''">
          {{ data.type }}
        </span>
        <span class="mx-1">•</span>
        <template v-if="data.primary_location?.source?.display_name">
          <span :class="isCompare && matches['primary_source_lost'] ? 'text-red-lighten-2' : (isCompare && matches['primary_source_added'] ? 'text-green-lighten-2' : '')">
            {{ data.primary_location.source?.display_name }}
          </span> 
          <span v-if="!data.primary_location.source?.id" class="text-red-lighten-2 ml-1">- Source ID Missing</span>
        </template>
        <template v-else>
          <span class="text-red-lighten-2">Source Missing</span>
        </template>
      </div>
    </template>

    <!--Sources-->
    <template v-else-if="entityType === 'sources'">
      <div class="mb-0" style="font-size: 18px; cursor: pointer;" @click="emit('title-click', id)">
        <span v-if="data.display_name">
          {{ data.display_name }}
        </span>
        <span v-else class="text-red-lighten-2">Display Name Missing</span>
        
        <!--Type, Host, OA Status-->
        <div class="text-caption text-grey-darken-2" style="font-size: 14px !important;">
          <span>
            {{  data.type }}
          </span>
          <span v-if="data.host_organization_name">
            <span class="mx-1">•</span>
            {{ data.host_organization_name }}
          </span>
          <span class="mx-1">•</span>
          <span>
            {{ data.is_oa ? 'open access' : 'closed access' }}
          </span>
        </div>
        <div v-if="data.works_count" class="text-caption text-grey-darken-2" style="font-size: 14px !important;">
          {{ data.works_count.toLocaleString() }} works
        </div>
      </div>
    </template>

    <!-- Institutions-->
    <template v-else-if="entityType === 'institutions'">
      <div class="mb-0" style="font-size: 18px; cursor: pointer;" @click="emit('title-click', id)">
        <span v-if="data.display_name">
          {{ data.display_name }}
        </span>
        <span v-else class="text-red-lighten-2">Display Name Missing</span>
        
        <!--Type, Host, OA Status-->
        <div class="text-caption text-grey-darken-2" style="font-size: 14px !important;">
          <span v-if="data.geo">
            {{ data.geo.city }}, {{ data.geo.country }}
            <span class="mx-1">•</span>
          </span>
          <span>
            {{  data.type }}
          </span>
        </div>
        <div v-if="data.works_count" class="text-caption text-grey-darken-2" style="font-size: 14px !important;">
          {{ data.works_count.toLocaleString() }} works
        </div>
      </div>
    </template>

    <!-- Default -->
    <template v-else>
      <div class="mb-0" style="font-size: 18px; cursor: pointer;" @click="emit('title-click', id)">
        <span v-if="data.display_name">
          {{ data.display_name }}
        </span>
        <span v-else class="text-red-lighten-2">Display Name Missing</span>

        <div v-if="data.works_count" class="text-caption text-grey-darken-2" style="font-size: 14px !important;">
          {{ data.works_count.toLocaleString() }} works
        </div>
      </div>
    </template>

    <!-- Current Test Value-->
    <template v-if="highlightTest">
      <div class="mt-3" style="font-size: 14px;">
        <code class="text-grey-darken-4">
          {{ highlightTest.field }}: 
          <span :class="testValueClass">
            {{ getShortValue(highlightTestValue, highlightTest) }}
          </span>
        </code>
      </div>
    </template>
  </div>
  <div v-else>
    <div class="mb-0" style="font-size: 18px;">
      <span class="text-grey-darken-2">-</span>
    </div>
  </div>
</template>

<script setup>

import { computed } from 'vue';
import { getShortValue } from '@/qa/fieldHelpers'; 

defineOptions({ name: 'GoogleScholarView' });

const { id, entityType, data, matches, compareData, highlightTest, highlightTestValue } = defineProps({
  id: String,
  entityType: String,
  data: Object,
  matches: null,
  compareData: null,
  highlightTest: null,
  highlightTestValue: null,
});

const emit = defineEmits(['title-click']);

const isCompare = computed(() => !!compareData && !!matches);

const testValueClass = computed(() => {
  if (!isCompare.value) return '';
  if (highlightTest.test_type === 'bug') {
    return 'text-red';
  } else {
    return 'text-green-darken-1';
  }
});

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
