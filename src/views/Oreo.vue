<template>
  <div :class="['bg-color py-0 py-sm-12', mode]" style="min-height: calc(100vh - 70px);">
    <v-container :fluid="smAndDown" :class="['pa-0', 'pa-sm-4']">
      <v-row>

        <!-- Main Content -->
        <v-col cols="12">
          
          <!-- Title, Subtitle, Breadcrumbs -->
          <div>
            <v-breadcrumbs v-if="breadcrumbs" :items="breadcrumbs" divider="›" class="px-0 mt-n10" />
            <div class="d-flex align-end justify-space-between">
              <div class="text-h3 mb-2">
                {{ titles[mode].title }}
              </div>
              <v-btn v-if="mode === 'tests'"  variant="text" href="https://github.com/ourresearch/openalex-metrics-api/blob/main/schema.py" target="_blank">
                Tests on GitHub
                <v-icon icon="mdi-open-in-new" class="ml-1"></v-icon>
              </v-btn>
            </div>
              <div class="text-grey-darken-3 text-subtitle-1 mb-8" v-html="titles[mode].subtitle"></div>
          </div>

          <!-- List Count Above -->
          <div v-if="mode === 'list' && dataLoaded">  
            <div class="pt-0 pb-1">
              <div class="px-4 pt-2 pb-1 text-grey-darken-2">
                <div v-if="resultsMeta" style="font-size: 14px;">
                  {{ resultsCountStr }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tests Fitler, Sort, Count Above -->
          <div v-if="mode === 'tests' && dataLoaded" class="pt-0 pb-2">
            <div class="mb-1">
              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal" class="mr-1">
                    Type: &nbsp;<b>{{ {all: 'All', bugs: 'Bugs', features: 'Features'}[testTypeFilter] }}</b>
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item @click="testTypeFilter = 'all'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testTypeFilter === 'all' ? '' : 'opacity-0']"></v-icon>
                      All
                    </div>
                  </v-list-item>
                  <v-list-item @click="testTypeFilter = 'bugs'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testTypeFilter === 'bugs' ? '' : 'opacity-0']"></v-icon>
                      Bugs
                    </div>
                  </v-list-item>
                  <v-list-item @click="testTypeFilter = 'features'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testTypeFilter === 'features' ? '' : 'opacity-0']"></v-icon>
                      Features
                      <v-spacer></v-spacer>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal" class="mr-1">
                    Category: &nbsp;<b>{{ filters.titleCase(testCategoryFilter) }}</b>
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item v-for="category in testCategoryOptions" :key="category" @click="testCategoryFilter = category">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testCategoryFilter === category ? '' : 'opacity-0']"></v-icon>
                      {{ filters.titleCase(category) }}
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div class="d-flex align-end ml-3">
              <div class="text-grey-darken-2" style="font-size: 14px;">
                {{ testsResultsStr }}
              </div>
              <v-spacer></v-spacer>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" rounded="pill" color="blue-darken-1" variant="text">
                    Sort:
                    {{ {alphabetical: 'Alphabetical', failRate: 'Fail Rate', addRate: 'Add Rate'}[testSort] }}
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="testSort = 'alphabetical'">
                    <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSort === 'alphabetical' ? '' : 'opacity-0']"></v-icon>
                    Alphabetical
                  </v-list-item>
                  <v-list-item @click="testSort = 'failRate'">
                    <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSort === 'failRate' ? '' : 'opacity-0']"></v-icon>
                    Fail Rate
                  </v-list-item>
                  <v-list-item @click="testSort = 'addRate'">
                    <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSort === 'addRate' ? '' : 'opacity-0']"></v-icon>
                    Add Rate
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- Entity -->
          <v-card v-if="mode === 'entity'" flat rounded="xl" class="px-6 py-10">
            <v-row>
              <v-col cols="12" md="6">
                <v-hover>
                  <template v-slot:default="{ isHovering, props }">
                    <v-card 
                      flat 
                      rounded="xl" 
                      fill-height 
                      v-bind="props" 
                      :class="isHovering ? 'bg-blue-lighten-5' : 'bg-grey-lighten-3'" 
                      class="pa-4 mx-1"
                      @click="router.push(`/${entityType}/tests`)">
                      <v-card-title style="font-size: 28px;">Tests</v-card-title>
                      <v-card-text>
                        <div v-if="dataLoaded">
                          <span class="">
                            <b style="font-size: 20px;" >{{ schema[entityType].length }}</b>
                            <span style="font-size: 18px;" class="ml-1">tests</span>
                            <span style="font-size: 16px;" class="mx-2">•</span>
                            <b style="font-size: 20px;" >{{ schema[entityType].filter(f => f.test_type === 'bug').length }}</b>
                            <span style="font-size: 18px;" class="ml-1">bug tests</span>
                            <span style="font-size: 16px;" class="mx-2">•</span>
                            <b style="font-size: 20px;" >{{ schema[entityType].filter(f => f.test_type === 'feature').length }}</b>
                            <span style="font-size: 18px;" class="ml-1">feature tests</span>
                          </span>
                        </div>
                        <v-skeleton-loader v-else type="list-item"></v-skeleton-loader>
                      </v-card-text>
                    </v-card>
                  </template>
                </v-hover>
              </v-col>
              <v-col cols="12" md="6">
                <v-hover>
                  <template v-slot:default="{ isHovering, props }">
                    <v-card 
                      flat 
                      rounded="xl" 
                      fill-height 
                      v-bind="props" 
                      :class="isHovering ? 'bg-blue-lighten-5' : 'bg-grey-lighten-3'"
                      class="pa-4 mx-1"
                      @click="router.push(`/${entityType}/plots`)"
                    >
                      <v-card-title style="font-size: 28px;">Plots</v-card-title>
                      <v-card-text>
                        <div v-if="dataLoaded" class="d-flex align-center">
                        </div>
                        <v-skeleton-loader v-else type="list-item"></v-skeleton-loader>
                      </v-card-text>
                    </v-card>
                  </template>
                </v-hover>
              </v-col>
            </v-row>
          </v-card>

          <v-card v-else flat class="pt-2 pb-0 px-4 rounded-o" style="overflow: hidden !important;">

            <!-- Results -->
            <div class="mx-n4 results-section">

              <!-- List -->
              <div v-if="mode == 'list'">
                <v-col cols="12" v-if="dataLoaded">
                  <div v-if="testKey === 'works_lost'">
                    <sample-explorer source="prod-only" :fractionToShow="scaledCoverage[entityType].prodOnlyExact"/>
                  </div>

                  <div v-else-if="testKey === 'works_added'">
                    <sample-explorer source="walden-only" :fractionToShow="scaledCoverage[entityType].waldenOnlyExact"/>
                  </div>

                  <div v-else>  
                    <v-data-table
                      v-if="resultsMeta"
                      class="results-table fixed-table"
                      :headers="listHeaders"
                      :items="listItems"
                      :items-per-page="-1"
                      flat
                      hide-default-footer
                      density="compact"
                      item-value="name"
                    >
                      <template v-slot:headers="{ columns }">
                        <tr>
                          <th v-for="column in columns" :key="column.key" :style="{width: column.width}">
                            <span>{{ column.title }}</span>
                          </th>
                        </tr>
                      </template>

                      <!-- List Table Rows -->
                      <template v-slot:item="{ item, columns }">
                        <tr>
                          <td v-for="column in columns" :key="column.key">
                            
                            <div v-if="column.key === 'prod'" class="py-7 pr-4">
                              <google-scholar-view 
                                :id="item._id" 
                                :data="prodResults[item._id]"
                                @title-click="compareId = item._id" />
                            </div>

                            <div v-else-if="column.key === 'walden'" class="py-7 pr-4">
                              <google-scholar-view 
                                :id="item._id" 
                                :data="waldenResults[item._id]"
                                :matches="matches[item._id]"
                                :compare-data="prodResults[item._id]" 
                                @title-click="compareId = item._id"/>
                            </div>          
                          </td>
                        </tr>
                      </template>
                    </v-data-table>
                    <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
                  </div>
                </v-col>
                <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
              </div>

              <!-- Tests  -->
              <div v-else-if="mode == 'tests' && dataLoaded">
                <v-data-table
                  v-if="testItems"
                  :headers="testHeaders"
                  :items="sortedTestItems"
                  :items-per-page="-1"
                  flat
                  hide-default-header
                  hide-default-footer
                >
                  <template v-slot:item="{ item, columns }">
                    <v-hover>
                      <template v-slot:default="{ isHovering, props }">
                        <tr 
                          v-bind="props" 
                          :class="[isHovering ? 'bg-grey-lighten-3' : '', 'cursor-pointer']" 
                          v-ripple 
                          @click="router.push(item.filterUrl)"
                        >
                          <td v-for="column in columns" :key="column.key" :style="{width: column.width || 'auto'}" :class="column.tight ? 'px-1' : ''">
      
                            <template v-if="column.key === 'donut'">
                              <v-progress-circular 
                                size="24" 
                                width="10" 
                                :color="item.test_type === 'bug' ? 'red' : 'green'" :model-value="item.rate">
                              </v-progress-circular>
                            </template>

                            <template v-if="column.key === 'rate'">
                              <div class="text-right">
                                <code>{{ item.rate }}%</code>
                              </div>
                            </template>

                            <template v-if="column.key === 'type'">
                              <v-icon :icon="item.test_type === 'bug' ? 'mdi-bug' : 'mdi-rocket-launch'" :color="item.test_type === 'bug' ? 'red' : 'green'" />
                            </template>

                            <template v-else-if="column.key === 'display_name'">
                              <span class="font-weight-medium">{{ item.display_name }}</span>
                              <v-chip :color="'black'" variant="tonal" size="x-small" class="ml-2">{{ item.category }}</v-chip>

                            </template>

                            <template v-else-if="column.key === 'description'">
                              <span class="test-description" v-html="item.description"></span>
                            </template>

                          </td>
                        </tr>
                      </template>
                    </v-hover>
                  </template>
                </v-data-table>
              </div>
              <template v-else-if="mode === 'tests'">
                <v-skeleton-loader type="list-item-three-line@12"></v-skeleton-loader>
              </template>

              <!-- Home -->
              <div v-if="mode === 'home'">
                <v-col v-if="coverageItems" cols="12" lg="9" xl="6">
                  <v-data-table
                    :headers="coverageHeaders"
                    :items="coverageItems"
                    :items-per-page="-1"
                    :hide-default-footer="true"
                    flat
                    class="metrics-table"
                  >
                    <template #headers="{ columns }">
                      <tr>
                        <th
                          v-for="column in columns"
                          :key="column.key"
                          :class="['font-weight-bold', column.align === 'end' ? 'text-right' : 'text-left']"
                          :style="column.width ? { width: column.width } : {}"
                        >
                          {{ column.title }}
                        </th>
                      </tr>
                    </template>
                    <template v-slot:item="{ item, columns }">
                      <v-hover>
                        <template v-slot:default="{ isHovering, props }">
                          <tr v-bind="props" :class="[isHovering ? 'bg-grey-lighten-3' : '', 'cursor-pointer']" v-ripple @click="router.push(`/${item.type}`)">
                            <td v-for="column in columns" :key="column.key">
                              <template v-if="column.key === 'type'">
                                <code>/{{ item.type }}</code>
                              </template>

                              <template v-else-if="column.key === 'sampleSize'">
                                <div class="text-right"><code>{{ item.sampleSize.toLocaleString() }}</code></div>
                              </template>

                              <template v-else>
                                <div class="text-right">
                                  <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                                  <div v-else><code>{{ item[column.key] }}</code></div>
                                </div>
                              </template>
                            </td>
                          </tr>
                        </template>
                      </v-hover>
                    </template>
                  </v-data-table>
                </v-col>
                <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
              </div>

              <!-- Pagination -->
              <v-pagination
                v-model="page"
                v-if="mode === 'list' && testKey !== 'works_lost' && testKey !== 'works_added'"
                :length="resultsMeta ? Math.floor((resultsMeta.count * scaledCoverage[entityType].bothExact) / pageSize) : 0"
                :total-visible="10"
                rounded
                class="py-4"
              ></v-pagination>

            </div>
          </v-card>

        </v-col>
      </v-row>
    </v-container>

    <!-- Compare Field Dialog -->
    <v-dialog 
      max-width="70vw" 
      max-height="70vh"
      width="auto"
      v-model="showCompareFieldDialog"
      @update:model-value="(val) => { if (!val) closeCompareFieldDialog() }"
    >
      <compare-field
        v-if="showCompareFieldDialog"
        :id="compareTestId"
        :test="schema[entityType].find(t => t.key === compareTestKey)"
        :match="matches[compareTestId][compareTestKey]"
        :prod-value="getTestValue(compareTestId, compareTestKey, 'prod')"
        :walden-value="waldenResults[compareTestId] ? getTestValue(compareTestId, compareTestKey, 'walden') : '[404]'"
        @close="closeCompareFieldDialog"
        @show-comparison="onShowComparison(compareTestId, compareTestKey, $event)"
      />
    </v-dialog>

    <!-- Compare Work Dialog -->
    <v-dialog 
      v-if="schema"
      max-width="80vw" 
      max-height="80vh"
      :model-value="!!compareId"
      scroll-strategy="block"
      class="rounded-o"
      @update:model-value="(val) => { if (!val) compareId = null }"
    >
      <compare-work
        v-if="compareId"
        :id="compareId"
        :schema="schema.works"
        :matches="matches[compareId]"
        :prod-results="prodResults[compareId]"
        :walden-results="waldenResults[compareId]"
        :compare-view="compareView"
        @close="compareId = null"
        @update:compare-view="compareView = $event"
      />
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, toRefs, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify';
import axios from 'axios';

import filters from "@/filters";
import { useParams } from '@/composables/useStorage';
import CompareField from '@/components/QA/CompareField.vue';
import CompareWork from '@/components/QA/CompareWork.vue';
import GoogleScholarView from '@/components/QA/googleScholarView.vue';
import SampleExplorer from '@/components/SampleExplorer.vue';

defineOptions({ name: 'Oreo' });

const props = defineProps({
  mode: {
    type: String,
    default: 'works',
  },
  entityType: {
    type: String,
    default: 'works',
  },
  testKey: {
    type: String,
    default: null,
  },
});

const route = useRoute()
const router = useRouter()
const currentRoute = ref(route.path)

const metricsUrl   = `https://metrics-api.openalex.org`;
//const metricsUrl   = `http://localhost:5006`;

const { mode, entityType, testKey } = toRefs(props);

const schema         = ref(null);

const compareId            = useParams('compareId', 'string', null);
const compareView          = useParams('compareView', 'string', 'diff');
const pageSize             = useParams('pageSize', 'number', 20);
const page                 = useParams('page', 'number', 1);
const testSort             = useParams('testSort', 'string', 'failRate');
const testTypeFilter       = useParams('testType', 'string', 'all');
const testCategoryFilter   = useParams('testCategory', 'string', 'all');
const compareTestId        = useParams('compareTestId', 'string', null);
const compareTestKey       = useParams('compareTestKey', 'string', null);

const prodResults          = reactive({});
const waldenResults        = reactive({});
const matches              = reactive({});
const resultsMeta          = ref(null);
const matchRates           = reactive({});
const coverage             = reactive({});

const matchRatesLoaded     = ref(false);
const coverageLoaded       = ref(false);
const dataLoaded           = computed(() => matchRatesLoaded.value && coverageLoaded.value);

const currentTest = computed(() => {
  if (!testKey.value || !schema.value || !schema.value[entityType.value]) { return null; }
  return schema.value[entityType.value].find(t => t.key === testKey.value);
});

const { smAndDown, mdAndDown } = useDisplay();

const titles = computed(() => {
  return {
    "entity": {
      "title": filters.titleCase(entityType.value),
      "subtitle": "Explore tests and sample data from production and Walden"
    },
    "list": {
      "title": currentTest.value ? currentTest.value.display_name : "",
      "subtitle": currentTest.value ? currentTest.value.description : ""
    },
    "tests": {
      "title": filters.titleCase(entityType.value) + " Tests",
      "subtitle": "Total pass rates of key tests across the full sample set"
    },
    "home": {
      "title": "Home",
      "subtitle": "Explore coverage and test rates between production and Walden across all endpoints"
    }
  };
});

const breadcrumbs = computed(() => {
  if (mode.value === "home") { return null; }
  const items = [
    { title: "Home", disabled: false, to: "/" },
  ];
  if (mode.value === "entity") {
    items.push({ title: filters.titleCase(entityType.value), disabled: true, to: `/${entityType.value}` });
  } else if (mode.value === "list") {
    items.push({ title: filters.titleCase(entityType.value), disabled: false, to: `/${entityType.value}` });
    items.push({ title: "Tests", disabled: false, to: `/${entityType.value}/tests` });
    items.push({ title: currentTest.value ? currentTest.value.display_name : "", disabled: true, to: `/${entityType.value}/tests/${testKey.value}` });
  } else if (mode.value === "tests") {
    items.push({ title: filters.titleCase(entityType.value), disabled: false, to: `/${entityType.value}` });
    items.push({ title: "Tests", disabled: true, to: `/${entityType.value}/tests` });
  }
  return items;
});

const getTestValue = (id, testKey, source) => {
  if (testKey in matches[id]["_test_values"]) {
    return matches[id]["_test_values"][testKey][source];
  }

  const test = schema.value[entityType.value].find(t => t.key === testKey);

  const obj = source === "prod" ? prodResults[id] : waldenResults[id];
  return getFieldValue(obj, test.field);
};

const getFieldValue = (obj, field) => {
  if (!obj) { return undefined; }
  if (!field) { console.trace();return undefined; }

  const keys = field.split(".");
  let value = obj;
  for (let i = 0; i < keys.length; i++) {
    value = value !== null && typeof value === "object" ? value[keys[i]] : undefined;
    if (value === undefined) {
      return undefined;
    }
  }
  return value;
};

const matchedIds = computed(() => {
  return matches ? Object.keys(matches) : [];
});

const listHeaders = computed(() => {
  const columns = [
    {title: "Prod", key: "prod", width: mdAndDown.value ? "250px" : "400px"},
    {title: "Walden", key: "walden", width: mdAndDown.value ? "250px" : "400px"},
  ];
  return columns;
});

const listItems = computed(() => {
  const rows = [];

  matchedIds.value.forEach(id => {
    const prod = prodResults[id];
    const walden = waldenResults[id];
    if (prod !== undefined && walden !== undefined) {
      rows.push(makeRow(id));
    }
  });
  return rows;
});

const makeRow = (id) => {
  const row = {};
  row._id = id;
  row.prodUrl = `https://api.openalex.org/${entityType.value}/${id}`;
  row.waldenUrl = `https://api.openalex.org/v2/${entityType.value}/${id}`;
  return row;
};

const resultsCountStr = computed(() => {
  if (!resultsMeta.value) { return null; }

  const scale = scaledCoverage.value[entityType.value];
  let totalNum;
  if (testKey.value === "works_lost") {
    totalNum = Math.round(10000 * scale.prodOnlyExact);
  } else if (testKey.value === "works_added") {
    totalNum = Math.round(10000 * scale.waldenOnlyExact);
  } else {
    totalNum = Math.round(resultsMeta.value.count * scale.bothExact);
  } 
  const startNum = ((page.value-1) * pageSize.value + 1).toLocaleString();
  const endNum = (Math.min(page.value * pageSize.value, totalNum)).toLocaleString();
  return `${startNum}-${endNum} of ${totalNum.toLocaleString()} results`;
});

const testHeaders = computed(() => {
  return [
    { title: '', key: 'donut', width: "35px", tight: false },
    { title: '', key: 'rate', width: "35px", tight: true },
    { title: '', key: 'type', width: "35px", tight: true },
    { title: '', key: 'display_name' },
    { title: '', key: 'category' },
    { title: '', key: 'description' },
  ];
});

const testItems = computed(() => {
  if (!schema.value || !matchRates[entityType.value] || !Object.keys(matchRates[entityType.value]).length) { return null; }

  const rows = []; 
  schema.value[entityType.value].forEach(test => {
    rows.push({
      ...test,
      rate: test.rate || matchRates[entityType.value][test.key],
      filterUrl: `/${entityType.value}/tests/${test.key}`,
    });
  });
  return rows;
});

const sortedTestItems = computed(() => {
  let items = [...testItems.value];
  
  if (testTypeFilter.value === 'bugs') {
    items = items.filter(item => item.test_type === 'bug');
  } else if (testTypeFilter.value === 'features') {
    items =  items.filter(item => item.test_type === 'feature');
  }

  if (testCategoryFilter.value !== 'all') {
    items = items.filter(item => item.category === testCategoryFilter.value);
  }

  return items.sort((a, b) => {
    if (testSort.value === 'alphabetical') {
      return a.display_name.localeCompare(b.display_name);
    } else if (testSort.value === 'failRate') {
      if (a.test_type !== b.test_type) {
        return a.test_type === 'bug' ? -1 : 1;
      }
      return b.rate - a.rate;
    } else if (testSort.value === 'addRate') {
      if (a.test_type !== b.test_type) {
        return a.test_type === 'feature' ? -1 : 1;
      }
      return b.rate - a.rate;
    }
  });
});

const testCategoryOptions = computed(() => {
  const categories = new Set();
  testItems.value.forEach(test => {
    categories.add(test.category);
  });
  return ["all", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
});

const testsResultsStr = computed(() => {

  const parts = [];
  if (testTypeFilter.value === "all") {
    parts.push(`${schema.value[entityType.value].length} tests`);
    parts.push(`${schema.value[entityType.value].filter(test => test.test_type === "bug").length} bug tests`);
    parts.push(`${schema.value[entityType.value].filter(test => test.test_type === "feature").length} feature tests`);
  } else if (testTypeFilter.value === "bugs") {
    parts.push(`${schema.value[entityType.value].filter(test => test.test_type === "bug").length} bug tests`);
  } else if (testTypeFilter.value === "features") {
    parts.push(`${schema.value[entityType.value].filter(test => test.test_type === "feature").length} feature tests`);
  }

  return parts.join(" • ");
});

const openCompareFieldDialog = (itemId, key) => {
  compareTestId.value = itemId;
  compareTestKey.value = key;
}

const closeCompareFieldDialog = () => {
  compareTestId.value = null;
  compareTestKey.value = null;
}

const showCompareFieldDialog = computed(() => {
  return compareTestId.value !== null && compareTestKey.value !== null;
});
  
const onShowComparison = (itemId, columnKey, event) => {
  compareTestId.value = null;
  compareTestKey.value = null;
  compareId.value = event;
}

const coverageHeaders = computed(() => {
  return [
    { 
      title: 'Entity',
      key: 'type',
      align: 'right',
      width: "200px",
      sortable: true,
    },
    { 
      title: 'Prod Only %', 
      key: 'prodOnly',
      align: 'end',
      isLink: true,
      width: "125px",
      sortable: true,
    },
    { 
      title: 'Both %', 
      key: 'both',
      align: 'end',
      isLink: true,
      width: "125px",
      sortable: true,
    },
    { 
      title: 'Walden Only %', 
      key: 'waldenOnly',
      align: 'end',
      isLink: true,
      width: "125px",
      sortable: true,
    },
    { 
      title: 'Sample Size', 
      key: 'sampleSize',
      align: 'end',
      sortable: true,
    },
  ];
});

const coverageItems = computed(() => {
  if (!Object.keys(coverage).length) { return null; }
  const rows = []; 
  Object.keys(coverage).forEach(entity => {
    let scaledCoverageItem = scaledCoverage.value[entity];
    rows.push({
      type: entity,
      prodOnly: scaledCoverageItem.prodOnly,
      both: scaledCoverageItem.both,
      waldenOnly: scaledCoverageItem.waldenOnly,
      testFailRate: entity in matchRates ? matchRates[entity]["_average_bug"] : "-",
      sampleSize: coverage[entity]["prod"]["sampleSize"],
    });
  });
  return defaultCoverageSort(rows);
});

const defaultCoverageSort = (rows) => {
  const top = ["works", "authors", "sources", "funders", "topics", "institutions", "publishers"];

  return rows.sort((a, b) => {
    const aIndex = top.indexOf(a.type);
    const bIndex = top.indexOf(b.type);
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) {
      return -1;
    }
    if (bIndex !== -1) {
      return 1;
    }
    return a.type.localeCompare(b.type);
  });
};

const scaledCoverage = computed(() => {
  const scaled = {};
  Object.keys(coverage).forEach(entity => {
    scaled[entity] = calcScaledCoverage(coverage[entity]);
  });
  return scaled;
});

const calcScaledCoverage = (data) => {
  if (data.walden.coverage === "-") {
    return {
      prodOnly: 100 - data.prod.coverage,
      waldenOnly: "-",
      both: data.prod.coverage,
      prodOnlyExact: (100 - data.prod.coverage) / 100,
      waldenOnlyExact: 0,
      bothExact: data.prod.coverage / 100,
    };
  }

  const prodRate = data.prod.coverage;
  const waldenRate = data.walden.coverage;
  const prodCount = data.prod.count;
  const waldenCount = data.walden.count;
  
  const prodBoth = (prodRate / 100) * prodCount;
  const waldenBoth = (waldenRate / 100) * waldenCount;
  const averageBoth = (prodBoth + waldenBoth) / 2;

  const prodOnly = prodCount - averageBoth;
  const waldenOnly = waldenCount - averageBoth;

  const totalCount = prodOnly + waldenOnly + averageBoth;

  return {
    prodOnly: Math.round((prodOnly / totalCount) * 100),
    waldenOnly: Math.round((waldenOnly / totalCount) * 100),
    both: Math.round((averageBoth / totalCount) * 100),
    prodOnlyExact: prodOnly / totalCount,
    waldenOnlyExact: waldenOnly / totalCount,
    bothExact: averageBoth / totalCount,
  };
};

async function fetchSchema() {
  const apiUrl = `${metricsUrl}/schema`;
  const response = await axios.get(apiUrl);
  schema.value = response.data.tests_schema;
}

async function fetchMetricsResponses() {
  // Clear existing data safely
  prodResults && Object.keys(prodResults).forEach(key => delete prodResults[key]);
  waldenResults && Object.keys(waldenResults).forEach(key => delete waldenResults[key]);
  matches && Object.keys(matches).forEach(key => delete matches[key]);
  resultsMeta.value = null;
  
  let testFilter = "";
  if (currentTest.value) {
    testFilter = `&filterTest=${currentTest.value.key}`;
  }

  const apiUrl = `${metricsUrl}/responses/${entityType.value}?page=${page.value}${testFilter}&per_page=${pageSize.value}`;
  const response = await axios.get(apiUrl);
  response.data.results.forEach((item) => {
    prodResults[item.id] = item.prod;
    waldenResults[item.id] = item.walden;
    matches[item.id] = item.match;
  });
  resultsMeta.value = response.data.meta;
}

async function fetchMatchRates() {
  const apiUrl = `${metricsUrl}/match-rates`;
  const response = await axios.get(apiUrl);
  Object.keys(response.data.data).forEach(key => {
    matchRates[key] = response.data.data[key];
  });
  matchRatesLoaded.value = true;
}

async function fetchCoverage() {
  const apiUrl = `${metricsUrl}/coverage`;
  const response = await axios.get(apiUrl);
  Object.keys(response.data.data).forEach(key => {
    coverage[key] = response.data.data[key];
  });
  coverageLoaded.value = true;
  addPseudoTests();
}

const addPseudoTests = () => {
  const pseudoTests = [
    {
      "display_name": "Works Lost",
      "key": "works_lost",
      "test_type": "bug",
      "category": "other",
      "is_pseudo": true,
      "rate": 100 - coverage["works"]["prod"]["coverage"],
      "description": "Works that are in the prod sample but not in the Walden sample",
    },
    {
      "display_name": "Works Added",
      "key": "works_added",
      "test_type": "feature",
      "category": "other",
      "is_pseudo": true,
      "rate": coverage["works"]["walden"]["coverage"],
      "description": "Works that are in the Walden sample but not in the prod sample",
    },
  ];
  schema.value["works"].push(...pseudoTests);
};

onMounted(async () => {
  await fetchSchema();
  fetchMetricsResponses();
  fetchMatchRates();
  fetchCoverage();
});

watch(page, async () => {
  await fetchMetricsResponses();
});

watch(testKey, async () => {
  await fetchMetricsResponses();
});

watch(() => route.path, (newPath) => {
  currentRoute.value = newPath;
});
</script>


<style scoped>
.square-btn {
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
}
:deep(.v-number-input input) {
  text-align: center;
}
:deep(.results-table thead tr th) {
  border-bottom: 1px solid #E0E0E0 !important;
  white-space: nowrap;
}
.results-table td a {
  color: #555;
  text-decoration: none;
}
.results-table td a:hover {
  color: #555;
  text-decoration: underline;
}
.results-table .test-cell:hover {
 border: 1px solid #BDBDBD;
 background-color: white;
 opacity: 0.4;
}
.fixed-table >>> table {
  table-layout: fixed;
}
.results-table .icon-column {
  cursor: pointer;
  width: 40px;
  padding: 0;
  text-align: center;
}
.menu-item {
  cursor: pointer;
  padding: 12px 16px;
  margin-right: -16px;
  margin-left: -16px;
}
.menu-item:hover {
  background-color: #E0E0E0;
}
.results-table .spacer-column {
  text-align: center;
  padding: 0;
}
.table-scroll {
  position: relative;
  overflow-x: auto;
}
.fields-card {
  border-color: #BDBDBD;
}
.fixed-header {
  position: fixed;
  top: 0px;
  left: 0;
  width: auto;
  background: white;
  border-collapse: collapse;
  z-index: 1000;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  pointer-events: auto;
}
.fixed-header::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
.fixed-header table {
  min-width: max-content;
  width: max-content;
  border-collapse: collapse;
}
.fixed-header th {
  padding: 16px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid #ccc;
  white-space: nowrap;
  text-align: left;
}
.sticky-controls {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
}
:deep(.test-description code) {
  background-color: #f5f5f5;
  color: #d73a49;
  font-family: monospace;
  font-size: 0.95em;
  padding: 0.2em 0.4em;
  border-radius: 5px;
}
.v-card, .v-overlay {
  overflow: visible !important;
}
</style>