<template>
  <div :class="['bg-color py-0 py-sm-12', mode]" style="min-height: 70vh;">
    <v-container :fluid="smAndDown || sidebarLayout" :class="['pa-0', 'pa-sm-4']">
      <v-row>
        <v-col v-if="sidebarLayout" cols="3" class="list-sidebar" style="max-width: 320px;">
          <div v-if="dataLoaded" style="padding-top: 140px;">
            <v-list class="bg-color" density="compact">
              <v-list-item title="Show"></v-list-item>
              <v-divider class="mb-1"></v-divider>
              <v-list-item style="font-size: 14px;" @click="entityView = 'prod'">
                <div class="d-flex align-center">
                  <v-icon :icon="entityView === 'prod' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'" class="mr-2" color="grey-darken-2"></v-icon>
                  Prod Only
                  <v-spacer></v-spacer>
                  <span class="text-grey-darken-1" style="font-size: 14px;">{{ scaledCoverage[entityType].prodOnly }}%</span>
                </div>
              </v-list-item>
              <v-list-item style="font-size: 14px;" @click="entityView = 'both'">
                <div class="d-flex align-center">
                  <v-icon :icon="entityView === 'both' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'" class="mr-2" color="grey-darken-2"></v-icon>
                  Both
                  <v-spacer></v-spacer>
                  <span class="text-grey-darken-1" style="font-size: 14px;">{{ scaledCoverage[entityType].both }}%</span>
                </div>
              </v-list-item>
              <v-list-item style="font-size: 14px;" @click="entityView = 'walden'">
                <div class="d-flex align-center">
                  <v-icon :icon="entityView === 'walden' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'" class="mr-2" color="grey-darken-2"></v-icon>
                  Walden Only
                  <v-spacer></v-spacer>
                  <span class="text-grey-darken-1" style="font-size: 14px;">{{ scaledCoverage[entityType].waldenOnly }}%</span>
                </div>
              </v-list-item>
            </v-list>
            <v-list v-if="entityView === 'both'" class="bg-color" density="compact">
              <v-list-item title="Failing"></v-list-item>
              <v-divider class="mb-1"></v-divider>
              <v-list-item v-for="filter in defaultFields[entityType]" :key="filter" style="font-size: 14px;" @click="toggleFailingFilter(filter)">
                <div class="d-flex align-center">
                  <v-icon :icon="filterFailing.includes(filter) ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'" class="mr-2" color="grey-darken-2"></v-icon>
                  <code>{{ centerEllipsis(filter, 20) }}</code>
                  <v-spacer></v-spacer>
                  <span class="text-grey-darken-1 ml-4" style="font-size: 14px;">{{ 100-matchRates[entityType][filter] }}%</span>
                </div>
              </v-list-item>
            </v-list>
          </div>
        </v-col>

        <v-col :cols="sidebarLayout ? 9 : 12">
          <div>
            <v-breadcrumbs v-if="breadcrumbs" :items="breadcrumbs" divider="›" class="px-0 mt-n10" />
            <div class="text-h3 mb-3">
              {{ titles[mode].title }}
            </div>
            <div class="text-grey-darken-3 text-subtitle-1 mb-8">
              {{ titles[mode].subtitle }}
            </div>
          </div>

          <!-- List Filters -->
          <div v-if="mode === 'list'">
            <div v-if="mdAndDown" class="pt-0 pb-4 d-flex">
              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal" class="mr-1">
                    Show: &nbsp;<b>{{ {prod: 'Prod Only', both: 'Both', walden: 'Walden Only'}[entityView] }}</b>
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item @click="entityView = 'prod'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" class="mr-2" :color="entityView === 'prod' ? 'grey-darken-2' : 'white'"></v-icon>
                      Prod Only
                      <v-spacer></v-spacer>
                      <span class="text-grey-darken-1" style="font-size: 14px;">{{ scaledCoverage[entityType].prodOnly }}%</span>
                    </div>
                  </v-list-item>
                  <v-list-item @click="entityView = 'both'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" class="mr-2" :color="entityView === 'both' ? 'grey-darken-2' : 'white'"></v-icon>
                      Both
                      <v-spacer></v-spacer>
                      <span class="text-grey-darken-1" style="font-size: 14px;">{{ scaledCoverage[entityType].both }}%</span>
                    </div>
                  </v-list-item>
                  <v-list-item @click="entityView = 'walden'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" class="mr-2" :color="entityView === 'walden' ? 'grey-darken-2' : 'white'"></v-icon>
                      Walden Only
                      <v-spacer></v-spacer>
                      <span class="text-grey-darken-1" style="font-size: 14px;">{{ scaledCoverage[entityType].waldenOnly }}%</span>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
              
              <template v-if="filterFailing.length > 0 && entityView === 'both'">
                <v-chip v-for="filter in filterFailing" :key="filter" class="mr-1" variant="tonal" rounded="pill" color="red-lighten-1">
                  Failing: <code class="ml-1"><b>{{ filter }}</b></code>
                  <v-icon icon="mdi-close" class="ml-1" @click="filterFailing = filterFailing.filter((key) => key !== filter)"></v-icon>
                </v-chip>
              </template>
              
              <v-menu v-if="entityView === 'both'">
                <template v-slot:activator="{ props }">
                  <v-chip v-bind="props" rounded="pill" color="red-lighten-1" variant="tonal" class="mr-1">
                    <v-icon icon="mdi-plus"></v-icon>
                    Filter failing
                  </v-chip>
                </template>
                <v-list style="max-height: 60vh" rounded="xl">
                  <v-list-item v-for="filter in defaultFields[entityType].filter(f => !filterFailing.includes(f))" :key="filter" @click="toggleFailingFilter(filter)">
                    <div class="d-flex align-center">
                      <v-icon :icon="fieldIcons[filter]" class="mr-2" color="grey-darken-2"></v-icon>
                      {{ filter }}
                      <v-spacer></v-spacer>
                      <span class="text-grey-darken-1 ml-4" style="font-size: 14px;">{{ 100-matchRates[entityType][filter] }}%</span>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>

            </div>
          </div>

          <!-- Tests Count / Sort -->
          <div v-if="mode === 'tests' && dataLoaded" class="pt-0 pb-2 d-flex justify-space-between align-end">
            <div class="text-grey-darken-2" style="font-size: 14px;">
              {{ defaultFields[entityType].length }} tests • {{ 100 - matchRates[entityType]['_average'] }}% failing
            </div>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal">
                  Sort:
                  {{ summarySort === 'alphabetical' ? 'Alphabetical' : 'Fail Rate' }}
                  <v-icon icon="mdi-menu-down"></v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="summarySort = 'alphabetical'">
                  <v-icon icon="mdi-check" :color="summarySort === 'alphabetical' ? 'grey-darken-2' : 'white'"></v-icon>
                  Alphabetical
                </v-list-item>
                <v-list-item @click="summarySort = 'failRate'">
                  <v-icon icon="mdi-check" :color="summarySort === 'failRate' ? 'grey-darken-2' : 'white'"></v-icon>
                  Fail Rate
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <!-- Entity -->
          <v-row v-if="mode === 'entity'" class="px-2">
            <v-col cols="12" md="6">
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card flat rounded="xl" fill-height v-bind="props" :class="[isHovering ? 'bg-blue-lighten-4' : '', 'pa-2', 'cursor-pointer']" @click="router.push(`/entity/${entityType}/tests`)">
                    <v-card-title style="font-size: 24px;">Tests</v-card-title>
                    <v-card-text>
                      <div v-if="dataLoaded">
                        <span class="">
                          <b style="font-size: 20px;" >{{ defaultFields[entityType].length }}</b>
                          <span style="font-size: 18px;" class="ml-1">tests</span>
                          <span style="font-size: 16px;" class="mx-2">•</span>
                          <b style="font-size: 20px;" >{{ 100 - matchRates[entityType]['_average'] }}%</b>
                          <span style="font-size: 18px;" class="ml-1">failing</span>
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
                  <v-card flat rounded="xl" fill-height v-bind="props" :class="[isHovering ? 'bg-blue-lighten-4' : '', 'pa-2', 'cursor-pointer']" @click="router.push(`/entity/${entityType}/list`)">
                    <v-card-title style="font-size: 24px;">List</v-card-title>
                    <v-card-text>
                      <div v-if="dataLoaded" class="d-flex align-center">
                        <span class="">
                          <b style="font-size: 20px;" >{{ scaledCoverage[entityType].prodOnly }}%</b> 
                          <span style="font-size: 18px;" class="ml-1">Prod Only</span>
                          <span style="font-size: 14px;" class="mx-2">•</span>
                          <b style="font-size: 20px;" >{{ scaledCoverage[entityType].both }}%</b> 
                          <span style="font-size: 18px;" class="ml-1">Both</span>
                          <span style="font-size: 14px;" class="mx-2">•</span>
                          <b style="font-size: 20px;" >{{ scaledCoverage[entityType].waldenOnly }}%</b> 
                          <span style="font-size: 18px;" class="ml-1">Walden Only</span>
                        </span>
                      </div>
                      <v-skeleton-loader v-else type="list-item"></v-skeleton-loader>
                    </v-card-text>
                  </v-card>
                </template>
              </v-hover>
            </v-col>
          </v-row>

          <v-card v-else flat class="pt-2 pb-0 px-4 rounded-o" style="overflow: hidden !important;">

            <!-- Skeleton Loader -->
            <v-skeleton-loader 
              v-if="matchedIds.length === 0" 
              :type="mode === 'list' ? 'table' : 'list-item-three-line@12'" 
              class="mt-8"
            />

            <!-- Results -->
            <div v-else-if="matchedIds.length > 0" class="mx-n4 results-section">

              <!-- List -->
              <div v-if="mode == 'list'" ref="tableScrollRef" class="table-scroll">
                <v-col cols="12">
                  <div v-if="entityView === 'both'">
                    
                    <div class="px-4 pt-2 pb-0 text-grey-darken-2">
                      <div v-if="resultsMeta" style="font-size: 14px;">
                        {{ ((page-1)*pageSize+1).toLocaleString() }}-{{ Math.min(page*pageSize, Math.round(resultsMeta.count * scaledCoverage[entityType].bothExact)).toLocaleString() }} of 
                        {{ Math.round(resultsMeta.count * scaledCoverage[entityType].bothExact).toLocaleString() }} results 
                      </div>
                    </div>
                    
                    <v-data-table
                      ref="vDataTableRef"
                      class="results-table fixed-table"
                      :headers="headers"
                      :items="rows"
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

                      <!-- Table Rows -->
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

                            <div v-else-if="column.key === 'tests'">
                              <span v-for="test in item.failingTests" :key="test">
                                <v-tooltip open-delay="300" :text="test" location="bottom">
                                  <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props" class="ma-1" color="red-lighten-3" @click="openCompareFieldDialog(item._id, test)" :icon="fieldIcons[test]" />
                                  </template>
                                </v-tooltip>  
                              </span>
                            </div>
          
                          </td>
                        </tr>
                      </template>
                    </v-data-table>
                  </div>

                  <div v-else-if="entityView === 'prod'">
                    <sample-explorer source="prod-only" :fractionToShow="scaledCoverage[entityType].prodOnlyExact"/>
                  </div>

                  <div v-else-if="entityView === 'walden'">
                    <sample-explorer source="walden-only" :fractionToShow="scaledCoverage[entityType].waldenOnlyExact"/>
                  </div>
                </v-col>
              </div>

              <!-- Tests  -->
              <div v-else-if="mode == 'tests'">
                <v-row class="pa-4">
                  <template v-if="summaryItems">
                    
                    <v-col cols="12" md="6" lg="4" v-for="summaryCard in sortedSummaryItems" :key="summaryCard.fieldName">
                      <v-hover>
                        <template v-slot:default="{ isHovering, props }">
                          <v-card flat v-ripple v-bind="props" :class="[isHovering ? 'bg-grey-lighten-2' : 'bg-grey-lighten-4', 'cursor-pointer']" color="grey-lighten-4 pa-3" rounded="xl" class="fill-height">
                            <RouterLink :to="`/entity/${entityType}/list?filterFailing=${summaryCard.fieldName}&entityView=both`" custom v-slot="{ navigate }">
                              <div class="d-flex cursor-pointer" @click="navigate">
                                <div class="flex-shrink-0 mr-2 d-flex align-center">
                                  <v-progress-circular size="40" width="8" color="red" :model-value="summaryCard.failRate"></v-progress-circular>
                                </div>
                                <div>
                                  <v-tooltip v-if="summaryCard.fieldName !== centerEllipsis(summaryCard.fieldName)" :text="`${summaryCard.fieldName}`" location="bottom">
                                    <template v-slot:activator="{ props }">
                                      <code class="d-block" v-bind="props">{{ centerEllipsis(summaryCard.fieldName) }}</code>
                                    </template>
                                  </v-tooltip>
                                  <code v-else class="d-block">{{ summaryCard.fieldName }}</code>
                                  <span class="ml-1 text-grey-darken-1" size="x-small">{{ summaryCard.failRate }}%</span>
                                  <v-chip v-if="testOnField(summaryCard.fieldName)" class="ml-1" size="x-small" color="grey-darken-2">{{ testOnField(summaryCard.fieldName) }}</v-chip>
                                </div>
                              </div>
                            </RouterLink>
                          </v-card>
                        </template>
                      </v-hover>

                    </v-col>
                  </template>
                  <template v-else>
                    <v-skeleton-loader type="list-item-three-line@12"></v-skeleton-loader>
                  </template>
                </v-row>  
              </div>

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
                          <tr v-bind="props" :class="[isHovering ? 'bg-grey-lighten-3' : '', 'cursor-pointer']" v-ripple @click="router.push(`/entity/${item.type}`)">
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
                v-if="mode === 'list' && entityView === 'both'"
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
    
    <!-- Fixed Table Header -->
    <div
      v-if="headers.length > 0 && mode === 'list' && entityView === 'both'"
      ref="fixedHeaderRef"
      class="fixed-header"
      v-show="showFixedHeader"
    >
      <table class="results-table">
        <thead>
          <tr>
            <th v-for="column in headers" :key="column.key" :style="{width: column.width}">
              <span>{{ column.title }}</span>
            </th>
          </tr>
        </thead>
      </table>
    </div>

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
        :id="compareFieldId"
        :field="compareFieldField"
        :match="matches[compareFieldId][compareFieldField]"
        :type="schema[entityType][compareFieldField]"
        :prod-value="getFieldOrTestValue(compareFieldId, compareFieldField, 'prod')"
        :walden-value="waldenResults[compareFieldId] ? getFieldOrTestValue(compareFieldId, compareFieldField, 'walden') : '[404]'"
        @close="closeCompareFieldDialog"
        @show-comparison="onShowComparison(compareFieldId, compareFieldField, $event)"
      />
    </v-dialog>

    <!-- Compare Work Dialog -->
    <v-dialog 
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
        :schema="schema"
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

import { fieldIcons } from '@/qa/apiComparison';
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
});

const route = useRoute()
const router = useRouter()
const currentRoute = ref(route.path)

const schema         = ref(null);
const defaultFields  = ref(null);

const metricsUrl   = `https://metrics-api.openalex.org/`;
//const metricsUrl   = `http://localhost:5006/`;

const { mode, entityType } = toRefs(props);

const zoomId            = useParams('zoomId', 'string', null);
const zoomSource        = useParams('zoomSource', 'string', 'prod');
const compareId         = useParams('compareId', 'string', null);
const compareView       = useParams('compareView', 'string', 'diff');
const pageSize          = useParams('pageSize', 'number', 20);
const page              = useParams('page', 'number', 1);
const filterFailing     = useParams('filterFailing', 'array', []);
const entityView        = useParams('entityView', 'string', 'both');
const showProdColumn    = useParams('showProdColumn', 'boolean', true);
const summarySort       = useParams('summarySort', 'string', 'alphabetical');
const compareFieldId    = useParams('compareFieldId', 'string', null);
const compareFieldField = useParams('compareFieldField', 'string', null);

const prodResults          = reactive({});
const waldenResults        = reactive({});
const matches              = reactive({});
const resultsMeta          = ref(null);
const matchRates           = reactive({});
const coverage             = reactive({});

const matchRatesLoaded     = ref(false);
const coverageLoaded       = ref(false);
const dataLoaded           = computed(() => matchRatesLoaded.value && coverageLoaded.value);

const tableScrollRef       = ref(null);
const fixedHeaderRef       = ref(null);
const vDataTableRef        = ref(null);
const showFixedHeader      = ref(false);

const { smAndDown, mdAndDown } = useDisplay();

const sidebarLayout = computed(() => {
  return mode.value === "list" && !mdAndDown.value;
});

const titles = {
  "entity": {
    "title": filters.titleCase(entityType.value),
    "subtitle": "Explore tests and sample data from production and Walden"
  },
  "list": {
    "title": filters.titleCase(entityType.value) + " List",
    "subtitle": `Compare and explore ${entityType.value} from production and Walden with key tests`
  },
  "tests": {
    "title": filters.titleCase(entityType.value) + " Tests",
    "subtitle": "Total pass rates of key tests across the full sample set"
  },
  "home": {
    "title": "Home",
    "subtitle": "Explore coverage and test rates between production and Walden across all endpoints"
  },
};

const breadcrumbs = computed(() => {
  if (mode.value === "home") { return null; }
  const items = [
    { title: "Home", disabled: false, to: "/" },
  ];
  if (mode.value === "entity") {
    items.push({ title: filters.titleCase(entityType.value), disabled: true, to: `/entity/${entityType.value}` });
  } else if (mode.value === "list") {
    items.push({ title: filters.titleCase(entityType.value), disabled: false, to: `/entity/${entityType.value}` });
    items.push({ title: "List", disabled: true, to: `/entity/${entityType.value}/list` });
  } else if (mode.value === "tests") {
    items.push({ title: filters.titleCase(entityType.value), disabled: false, to: `/entity/${entityType.value}` });
    items.push({ title: "Tests", disabled: true, to: `/entity/${entityType.value}/tests` });
  }
  return items;
});

const getFieldOrTestValue = (id, field, source) => {
  if (field in matches[id]["_test_values"]) {
    return matches[id]["_test_values"][field][source];
  }
  const obj = source === "prod" ? prodResults[id] : waldenResults[id];
  return getFieldValue(obj, field);
};

const getFieldValue = (obj, field) => {
  if (!obj) { return undefined; }

  const id = extractID(obj.id);

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

const testOnField = (field) => {
  if (!schema.value) { return null; }
  const type = schema.value[entityType.value][field];
  const typeParts = type.split("|");
  if (typeParts.length > 1) {
    return typeParts[1];
  }
  return "=";
};

const fieldWithTest = (field) => {
  const test = testOnField(field);
  return test ? field + " " + test : field;
};

const headers = computed(() => {
  const columns = [
    {title: "Walden", key: "walden", width: mdAndDown.value ? "250px" : "400px"},
    {title: "Failing Tests", key: "tests", width: "200px"},
  ];
  if (showProdColumn.value) { columns.unshift({title: "Prod", key: "prod", width: mdAndDown.value ? "250px" : "400px"}); }

  return columns;
});

const rows = computed(() => {
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

  const failingTests = [];
  defaultFields.value[entityType.value].map(field => {    
    if (matches[id][field] === false) {
      failingTests.push(field);
    }
  });

  row.failingTests = failingTests;

  return row;
};

const getCellStyle = (item, column) => {  
  if (!item || ["prod", "walden", "spacer"].includes(column.key)) { return {}; }

  let passed = false;

  if (matches && matches[item._id] && matches[item._id][column.key]) {
    passed = true;
  }

  const styles = {width: column.width};

  styles.backgroundColor = passed ? "#DCEDC8" : "#FFCDD2";

  return styles;
}

const summaryItems = computed(() => {
  if (!defaultFields.value || !Object.keys(matchRates).length) { return null; }

  const rows = []; 
  defaultFields.value[entityType.value].forEach(key => {
    rows.push({
      fieldName: key,
      passRate: matchRates[entityType.value][key],
      failRate: 100 - matchRates[entityType.value][key],
    });
  });
  return rows;
});

const sortedSummaryItems = computed(() => {
  const items = [...summaryItems.value];
  return items.sort((a, b) => {
    if (summarySort.value === 'alphabetical') {
      return a.fieldName.localeCompare(b.fieldName);
    } else if (summarySort.value === 'failRate') {
      return b.failRate - a.failRate;
    }
  });
});

const centerEllipsis = (str, maxLen = 26) => {
  if (str.length <= maxLen) { return str; }
  
  // If there's a dot, prioritize showing text after the last dot
  if (str.includes('.')) {
    const lastDotIndex = str.lastIndexOf('.');
    const rightSide = str.slice(lastDotIndex); // includes the dot
    const remainingLength = maxLen - rightSide.length - 2; // subtract 3 for ".."
    
    if (remainingLength > 0) {
      const leftSide = str.slice(0, remainingLength);
      return leftSide + ".." + rightSide;
    } else {
      // If right side is too long, fall back to original logic
      const half = Math.floor(maxLen / 2);
      return str.slice(0, half) + ".." + str.slice(-half);
    }
  }
  
  // Original logic for strings without dots
  const half = Math.floor(maxLen / 2);
  return str.slice(0, half) + "..." + str.slice(-half);
}

const openCompareFieldDialog = (itemId, columnKey) => {
  compareFieldId.value = itemId;
  compareFieldField.value = columnKey;
}

const closeCompareFieldDialog = () => {
  compareFieldId.value = null;
  compareFieldField.value = null;
}

const showCompareFieldDialog = computed(() => {
  return compareFieldId.value !== null && compareFieldField.value !== null;
});
  
const onShowComparison = (itemId, columnKey, event) => {
  compareFieldId.value = null;
  compareFieldField.value = null;
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
      title: 'Tests Pass %', 
      key: 'testPassRate',
      align: 'end',
      isLink: true,
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
      testPassRate: entity in matchRates ? matchRates[entity]["_average"] : "-",
      sampleSize: coverage[entity]["prod"]["sampleSize"],
    });
  });
  return defaultCoverageSort(rows);
});

const defaultCoverageSort = (rows) => {
  const top = ["works", "authors", "sources", "funders", "topics","institutions", "publishers"];

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

const toggleFailingFilter = (field) => {
  if (filterFailing.value.includes(field)) {
    filterFailing.value = filterFailing.value.filter(f => f !== field);
  } else {
    filterFailing.value = [...filterFailing.value, field];
  }
};

const isDrawerOpen = computed(() => {
  return Boolean(zoomId.value);
});

const zoomData = computed(() => {
  if (!zoomId.value) { return null; }

  return zoomSource.value === "prod" ? prodResults[zoomId.value] : waldenResults[zoomId.value];
});

function onDrawerClose() {
  zoomId.value = null;
}

const extractID = (input) => {
  const orgIndex = input.indexOf('.org/');
  return orgIndex !== -1 ? input.substring(orgIndex + 5) : input;
}

async function fetchMetricsResponses() {
  // Clear existing data safely
  prodResults && Object.keys(prodResults).forEach(key => delete prodResults[key]);
  waldenResults && Object.keys(waldenResults).forEach(key => delete waldenResults[key]);
  matches && Object.keys(matches).forEach(key => delete matches[key]);
  resultsMeta.value = null;
  
  let failingFilter = "";
  if (filterFailing.value.length > 0) {
    failingFilter = `&filterFailing=${filterFailing.value.join(",")}`;
  }

  const apiUrl = `${metricsUrl}/responses?page=${page.value}${failingFilter}&per_page=${pageSize.value}`;
  const response = await axios.get(apiUrl);
  response.data.results.forEach((item) => {
    prodResults[item.id] = item.prod;
    waldenResults[item.id] = item.walden;
    matches[item.id] = item.match;
  });
  resultsMeta.value = response.data.meta;
}

async function fetchSchema() {
  const apiUrl = `${metricsUrl}/schema`;
  const response = await axios.get(apiUrl);
  schema.value = response.data.schema;
  defaultFields.value = response.data.testFields;
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
}

async function syncFixedHeader() {
  // Synchronize the fixed header's horizontal scroll, position, and column widths with the real table
  await nextTick();
  const scroll = tableScrollRef.value;
  const fixed = fixedHeaderRef.value;
  
  if (!scroll || !fixed) return;

  const left = scroll.getBoundingClientRect().left;
  fixed.style.left = `${left}px`;
  fixed.style.width = `${scroll.clientWidth}px`;
  fixed.style.overflow = 'hidden';

  const realThs = scroll.querySelectorAll('thead tr:first-child th');
  const fixedThs = fixed.querySelectorAll('thead tr:first-child th');
  if (realThs.length === fixedThs.length) {
    for (let i = 0; i < realThs.length; i++) {
      const w = realThs[i].offsetWidth;
      fixedThs[i].style.width = w + 'px';
      fixedThs[i].style.minWidth = w + 'px';
      fixedThs[i].style.maxWidth = w + 'px';
    }
  }
}

onMounted(async () => {
  window.addEventListener('resize', () => {
    syncFixedHeader();
  });
  await fetchSchema();
  fetchMetricsResponses();
  fetchMatchRates();
  fetchCoverage();
});

watch(page, async () => {
  await fetchMetricsResponses();
});

watch(filterFailing, async () => {
  console.log("filterFailing changed");
  await fetchMetricsResponses();
});

const handleWindowScroll = () => {
  // Fixed header visibility logic based on window scroll
  const wrapper = document.querySelector('.v-table__wrapper');
  if (!wrapper) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  showFixedHeader.value = wrapperRect.top < 0;
};

watch(() => Object.keys(matches).length, async (count) => {
  if (count > 0) {
    // Setup syncing fixed header with data table
    await nextTick();
    const scroll = document.querySelector('.v-table__wrapper');
    const fixed = fixedHeaderRef.value;
    if (scroll && fixed) {
      const scrollHandler = () => {
        fixed.scrollLeft = scroll.scrollLeft;
      };
      scroll.addEventListener('scroll', scrollHandler);
      fixed.scrollLeft = scroll.scrollLeft;
      syncFixedHeader();
      window.addEventListener('scroll', handleWindowScroll);
      handleWindowScroll(); // Call immediately to set showFixedHeader initially
    }
  }
});

watch(() => route.path, (newPath) => {
  currentRoute.value = newPath;
});

watch([tableScrollRef, fixedHeaderRef], () => {
  syncFixedHeader();
  handleWindowScroll();
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
:deep(.list-sidebar .v-list-item .v-list-item__content) {
  padding: 6px 0 !important;
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
.v-card, .v-overlay {
  overflow: visible !important;
}
</style>