<template>
  <div>
    <v-card class="rounded-o">
      <v-skeleton-loader v-if="isLoading" type="list-item-three-line@8" />
      
      <div v-else style="width: 100%;">
        <div class="header pa-4 pb-1 bg-grey-lighten-3" style="width: 100%;">
          <div class="d-flex" style="width: 100%;">
            <div style="flex: 1;" class="mr-4">
              <div class="card-title text-h6 mb-0">
                {{ prodResults.display_name }}
              </div>
              <div class="text-grey-darken-2 mt-1 mb-2" style="font-size: 12px;">
                {{ id }}
                <span v-if="mode === 'tests'">
                  <a :href="`https://api.openalex.org/${id}`" target="_blank" class="ml-2">
                    Prod
                    <v-icon size="x-small" icon="mdi-open-in-new"></v-icon>
                  </a>
                  <a :href="`https://api.openalex.org/${id}?data-version=2`" target="_blank" class="ml-2">
                    Walden
                    <v-icon size="x-small" icon="mdi-open-in-new"></v-icon>
                  </a>
                </span>
              </div>
            </div>
            <v-btn-toggle
              v-model="mode"
              color="blue"
              bg-color="white"
              variant="outlined"
              mandatory
              class="mr-2 mode-toggle"
              style="flex-shrink: 0;"
            >
              <v-btn value="json">JSON</v-btn>
              <v-btn value="tests">Tests</v-btn>
            </v-btn-toggle>
            <v-btn @click="emit('close')" size="default" icon variant="text" class="mt-n2">
              <v-icon size="default" variant="plain" icon="mdi-close"></v-icon>
            </v-btn>
          </div>
          <table class="header-table" width="100%">
          </table>       
        </div>

        <!-- Tests -->
        <div v-if="mode === 'tests'" class="diff-table-container">
          <table class="diff-table pa-4" style="table-layout: fixed; max-width: 100%;">
            <thead>
              <tr class="mb-2 text-grey-darken-3" style="font-size: 12px; border-bottom: 1px solid #f5f5f5;">
                <th>Test</th>
                <th>
                  <span style="margin-left: 20px;">Prod Value</span>
                </th>
                <th>
                  <span style="margin-left: 20px;">Walden Value</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="test in cleanedSchema" :key="test.key" :class="getDiffCellClass(test)">
                <td>
                  <div class="font-weight-bold">{{ test.display_name }}</div>
                  <code style="font-size: 12px;">{{ test.field }}</code>
                </td>
                <td
                  v-for="(source, index) in ['prod', 'walden']"
                  :key="index"
                  style="word-wrap: break-word; overflow-wrap: break-word;"
                >
                  <div v-if="source === 'prod' ? prodResults : waldenResults" class="d-flex">
                    <v-icon 
                      size="small"
                      class="mr-1 expand-icon"
                      :style="{visibility: isObject(getTestValueWrapper(test, source)) ? 'visible' : 'hidden'}"
                      @click="toggleExpanded(test.key)" 
                      :icon="expandedFields.has(test.key) ? 'mdi-menu-down' : 'mdi-menu-right'"
                    ></v-icon>
                    <span>
                      <template v-if="isObject(getTestValueWrapper(test, source)) && !expandedFields.has(test.key)">
                        <code style="white-space: pre-wrap">{{ getShortValue(getTestValueWrapper(test, source), test) }}</code>
                      </template>
                      <code v-else style="white-space: pre-wrap">{{ displayValue(getTestValueWrapper(test, source), test) }}</code>
                    </span>
                  </div>
                  <div v-else>404</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- JSON -->
        <div v-else-if="mode === 'json'" class="d-flex">
          <div class="json-container pb-4">
            <a :href="`https://api.openalex.org/${id}`" target="_blank" class="pb-3 font-weight-medium d-block sticky-top">
              Prod
              <v-icon size="x-small" icon="mdi-open-in-new"></v-icon>
            </a>
            <vue-json-pretty :data="prodResults" :deep="1"></vue-json-pretty>
          </div>
          <div class="json-container">  
            <a :href="`https://api.openalex.org/${id}?data-version=2`" target="_blank" class="pb-3 font-weight-medium d-block sticky-top">
              Walden
              <v-icon size="x-small" icon="mdi-open-in-new"></v-icon>
            </a>
            <vue-json-pretty :data="waldenResults" :deep="1"></vue-json-pretty>
          </div>
        </div>
      </div>
    </v-card>
  </div>

</template>

<script setup>

import { ref, reactive, computed, watch } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

import { getTestValue, getShortValue, displayValue, isObject } from '@/qa/fieldHelpers';


defineOptions({ name: 'CompareWork'});

const { id, entityType, schema, prodResults, waldenResults, matches, compareView } = defineProps({
  id: String,
  entityType: String,
  schema: Array,
  prodResults: null,
  waldenResults: null,
  matches: Object,
  compareView: { type: String, default: 'tests' }
});

const emit = defineEmits(['update:compareView', 'close']);

const mode = ref(compareView);
const expandedFields = reactive(new Set());

const isLoading = computed(() => !prodResults);

const cleanedSchema = computed(() => {
  let cleanedSchema = schema.filter(test => !test.is_pseudo);
  cleanedSchema = cleanedSchema.sort((a, b) => matches[a.key] ? -1 : 1);
  return cleanedSchema;
});

const getTestValueWrapper = (test, source) => {
  const results = source === 'prod' ? prodResults : waldenResults;
  return getTestValue(test, results, matches, source);
}

const toggleExpanded = (field) => {
  if (expandedFields.has(field)) {
    expandedFields.delete(field)
  } else {
    expandedFields.add(field)
  }
};

function getDiffCellClass(test) {
  if (test.test_type === "feature" && matches[test.key]) {
    return 'bg-green-lighten-4';
  }

  if (test.test_type === "bug" && matches[test.key]) {
    return 'bg-red-lighten-4';
  }

  return '';
}

watch(mode, (newMode) => {
  emit('update:compareView', newMode);
});

</script>


<style scoped>
.mode-toggle {
  width: 145px;
}
a {
  color: inherit;
  text-decoration: none;
}
.diff-table-container {
  overflow-y: scroll;
  overscroll-behavior: contain;
  max-height: 70vh;
}
.json-container {
  overflow-y: scroll;
  overscroll-behavior: contain;
  max-height: 70vh;
  padding: 0px 16px;
  width: 50%;
}
.diff-table {
  width: 100%;
  table-layout: fixed;
  max-width: 100%;
}
.diff-table thead {
  display: sticky;
  top: 0;
}
.diff-table th {
  border-bottom: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
.diff-table td {
  margin: 0 40px 0 0;
  padding: 8px;
  padding-right: 40px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
  border-bottom: 1px solid #E0E0E0;
}
.diff-table tbody tr:first-child td {
  padding-top: 4px;
}
.expand-icon {
  cursor: pointer;
}
code {
  white-space: pre-wrap; /* Preserves whitespace and allows wrapping */
}
.sticky-top {
  position: sticky;
  top: 0px;
  padding-top: 8px;
  background-color: #fff;
  z-index: 100;
}
</style>
