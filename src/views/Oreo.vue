<template>
  <div :class="['py-0 py-sm-4', mode]" style="min-height: calc(100vh - 70px);">
    <v-container :fluid="smAndDown" :class="['pa-0', 'pa-sm-4']">
      <v-row>
        
        <!-- Main Content -->
        <v-col cols="12" style="padding-top: 22px;">
          
          <!-- Title, Subtitle -->
          <div>
            <!-- List mode with two-column layout -->
            <div v-if="mode === 'list' && currentTest" class="d-flex align-start justify-space-between mb-8">
              <!-- Left column: Title, Subtitle, Tags -->
              <div style="flex: 1;">
                <div class="text-h3 mb-1">
                  {{ titles[mode].title }}
                </div>
                <div class="mb-2">
                  <span class="text-grey-darken-3 text-subtitle-1" v-html="titles[mode].subtitle"></span>
                </div>
                <div>
                  <v-chip 
                    label
                    :color="currentTest.test_type === 'bug' ? 'red' : 'green'"
                    variant="outlined"
                    size="small"
                    class="mr-2"
                  >
                    <v-icon size="small" class="mr-1">
                      {{ currentTest.test_type === 'bug' ? 'mdi-emoticon-sad-outline' : 'mdi-emoticon-happy-outline' }}
                    </v-icon>
                    {{ currentTest.test_type === 'bug' ? 'Bad' : 'Good' }}
                  </v-chip>
                  <v-chip 
                    label
                    color="grey"
                    variant="outlined"
                    size="small"
                    @click="router.push(`/${entityType}/tests?testCategory=${currentTest.category}`)"
                  >
                    {{ currentTest.category }}
                  </v-chip>
                </div>
              </div>

              <!-- Right column: Test Rate -->
              <div class="d-flex flex-column align-end ml-4">
                <div class="d-flex align-center">
                  <v-progress-circular 
                    size="40" 
                    width="8" 
                    color="black"
                    :model-value="testItem(currentTest.key)?.rate">
                  </v-progress-circular>
                  <span class="ml-2 font-weight-bold text-h3">
                    {{ testItem(currentTest.key)?.rate }}%
                  </span>
                </div>
                <div class="text-grey-darken-1" style="font-size: 14px; text-align: left; width: 100%;">
                  {{ filters.capitalize(entityType.replace('-', ' ')) }} changed
                </div>
              </div>
            </div>
            
            <!-- Plot mode with correlation on right -->
            <div v-else-if="mode === 'plots'" class="d-flex align-start justify-space-between mb-8">
              <div style="flex: 1;">
                <div class="text-h3 mb-1">
                  {{ titles[mode].title }}
                </div>
                <div class="mb-2">
                  <span class="text-grey-darken-3 text-subtitle-1" v-html="titles[mode].subtitle"></span>
                </div>
              </div>
              
              <!-- Right column: Correlation -->
              <div v-if="dataLoaded" class="d-flex flex-column align-end ml-4">
                <span class="font-weight-bold text-h3">
                  {{ coverage[entityType]["correlations"][plotKey] ? coverage[entityType]["correlations"][plotKey].toFixed(2) : '-' }}
                </span>
                <div class="text-grey-darken-1" style="font-size: 14px; text-align: left; width: 100%;">
                  Correlation
                </div>
              </div>
            </div>
            
            <!-- Other modes with simple layout -->
            <div v-else class="mb-8">
              <div class="text-h3 mb-1">
                {{ titles[mode].title }}
              </div>
              <div class="mb-2">
                <span class="text-grey-darken-3 text-subtitle-1" v-html="titles[mode].subtitle"></span>
              </div>
            </div>
          </div>

          <!-- Tests Search -->
          <!-- <div v-if="mode === 'tests'" class="d-flex align-start mb-4">
                <v-btn
                  v-if="!showTestsSearch"
                  @click="showTestsSearch = true"
                  variant="icon"
                  size="large"
                  class="mb-2"
                  density="comfortable"
                  color="grey-darken-2"
                  icon="mdi-magnify"
                ></v-btn>
                <v-slide-x-reverse-transition>
                  <v-text-field
                    v-if="showTestsSearch"
                    v-model="testsSearch"
                    variant="solo-filled"
                    bg-color="#dbe2eb"
                    flat
                    clearable
                    clear-icon="mdi-close"
                    hide-details
                    class="mb-2"
                    style="width: 250px;"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Search tests"
                  ></v-text-field>
                </v-slide-x-reverse-transition>
              </div> -->

              <!-- Entity Metrics-->
              <div v-if="mode === 'entity' && dataLoaded" class="mx-0">
                <div class="text-right" >
                  <span class="entity-metric" v-if="coverageItem(entityType).worksCountChange !== '-'">
                    <span class="entity-metric-value">
                      {{ !(coverageItem(entityType).worksCountChange < 0) ? "+" : "" }}{{ coverageItem(entityType).worksCountChange }}%
                    </span>
                    <span class="entity-metric-label ml-1">Works</span>
                  </span>

                  <span class="entity-metric" v-if="coverageItem(entityType).citationsCountChange !== '-'">
                    <span class="entity-metric-value">
                      {{ !(coverageItem(entityType).citationsCountChange <= 0) ? "+" : "" }}{{ coverageItem(entityType).citationsCountChange }}%
                    </span>
                    <span class="entity-metric-label ml-1">Citations</span>
                  </span>
                </div>
              </div>

          <!-- List above Card: Count  -->
          <div v-if="mode === 'list' && dataLoaded">  
            <div class="pt-0 pb-1">
              <div class="px-4 pt-2 pb-1 text-grey-darken-2">
                <div v-if="resultsMeta" style="font-size: 14px;">
                  {{ resultsCountStr }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tests above Card: Fitler, Sort, Count -->
          <div v-if="mode === 'tests' && dataLoaded" class="pt-0 pb-2">
            <div class="mb-1 d-flex">
              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-if="!testDirectionFilter" v-bind="props" label color="grey-darken-2" variant="outlined" style="border: 1px solid #BDBDBD;" class="mr-1">
                    Goodness
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                  <v-chip v-else v-bind="props" label :color="testDirectionFilter === 'good' ? 'green' : 'red'" class="mr-1">
                    <v-icon :icon="testDirectionFilter === 'good' ? 'mdi-emoticon-happy-outline' : 'mdi-emoticon-sad-outline'" class="mr-1"></v-icon>
                    <b>{{ filters.titleCase(testDirectionFilter) }}</b>
                    <v-icon icon="mdi-close" @click.stop="testDirectionFilter = null"></v-icon>
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item @click="testDirectionFilter = 'good'">
                    <div class="d-flex align-center text-green">
                      <v-icon icon="mdi-emoticon-happy-outline" class="mr-2" color="green"></v-icon>
                      Good
                      <v-spacer></v-spacer>
                      <v-icon icon="mdi-check" color="green" :class="testDirectionFilter === 'good' ? '' : 'opacity-0'"></v-icon>
                    </div>
                  </v-list-item>
                  <v-list-item @click="testDirectionFilter = 'bad'">
                    <div class="d-flex align-center text-red">
                      <v-icon icon="mdi-emoticon-sad-outline" class="mr-2" color="red"></v-icon>
                      Bad
                      <v-spacer></v-spacer>
                      <v-icon icon="mdi-check" color="red" :class="testDirectionFilter === 'bad' ? '' : 'opacity-0'"></v-icon>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-if="!testCategoryFilter" v-bind="props" label color="grey-darken-2" variant="outlined" style="border: 1px solid #BDBDBD;" class="mr-1">
                    Category
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                  <v-chip v-else v-bind="props" label color="blue-darken-1" variant="tonal" class="mr-1">
                    <b>{{ filters.titleCase(testCategoryFilter) }}</b>
                    <v-icon icon="mdi-close" @click.stop="testCategoryFilter = null"></v-icon>
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item v-for="category in testCategoryOptions" :key="category" @click="testCategoryFilter = category">
                    <div class="d-flex align-center">
                      {{ filters.titleCase(category) }}
                      <v-spacer></v-spacer>
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="testCategoryFilter === category ? '' : 'opacity-0'"></v-icon>
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
                  <v-btn v-bind="props" color="primary" variant="text">
                    Sort:
                    {{ filters.titleCase(testSort) }}
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="testSort = 'size'">
                    <div class="d-flex align-center">
                      Size
                      <v-spacer></v-spacer>
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="testSort === 'size' ? '' : 'opacity-0'"></v-icon>
                    </div>
                  </v-list-item>
                  <v-list-item @click="testSort = 'category'">
                    <div class="d-flex align-center">
                      Category
                      <v-spacer></v-spacer>
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="testSort === 'category' ? '' : 'opacity-0'"></v-icon>
                    </div>
                  </v-list-item>
                  <v-list-item @click="testSort = 'alphabetical'">
                    <div class="d-flex align-center">
                      Alphabetical
                      <v-spacer></v-spacer>
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="testSort === 'alphabetical' ? '' : 'opacity-0'"></v-icon>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- Entity -->
          <v-card v-if="mode === 'entity'" variant="outlined" class="px-6 py-10">
            <v-row>
              <v-col cols="12" md="6">
                <v-hover>
                  <template v-slot:default="{ isHovering, props }">
                    <v-card 
                      flat 
                      fill-height 
                      v-bind="props" 
                      :class="isHovering ? 'bg-grey-lighten-2' : 'bg-grey-lighten-3'" 
                      class="pa-4 mx-1"
                      @click="router.push(`/${entityType}/tests`)">
                      <v-card-title style="font-size: 28px;">Tests</v-card-title>
                      <v-card-text>
                        <div v-if="dataLoaded">
                          <span>
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
                      v-bind="props" 
                      :class="isHovering ? 'bg-grey-lighten-2' : 'bg-grey-lighten-3'"
                      class="pa-4 mx-1 fill-height"
                      @click="router.push(resultsMeta ? `/${entityType}/plots/${plotData[0].field}` : '#')"
                    >
                      <v-card-title style="font-size: 28px;">Plots</v-card-title>
                      <v-card-text>
                        <div v-if="resultsMeta" class="d-flex align-center" style="font-size: 18px;">
                          <b style="font-size: 20px;" class="mr-1">{{ plotData.length }}</b>
                          scatter plots for numeric fields
                        </div>
                        <v-skeleton-loader v-else type="list-item"></v-skeleton-loader>
                      </v-card-text>
                    </v-card>
                  </template>
                </v-hover>
              </v-col>
            </v-row>
          </v-card>

          
          <!-- Plots -->
          <div v-else-if="mode === 'plots'">
            <div v-if="resultsMeta">
              <div class="py-4">
                <scatter-plot
                  :title="currentPlot.title"
                  @click-point="handlePlotPointClick"
                  :data="currentPlot.data"
                />
              </div>
              <div v-if="plotTests && plotTests.length" class="mt-6">
                <div class="text-grey-darken-2 mb-3 font-weight-medium" style="font-size: 16px;">{{ plotTests.length }} Related Tests</div>
                <tests-table :items="plotTests"></tests-table>
              </div>
            </div>
          </div>


          <!-- Home uses separate cards, other modes use single card -->
          <template v-if="mode !== 'home'">
            <v-card variant="outlined" class="pb-0" style="overflow: hidden !important;">

              <!-- Results -->
              <div class="results-section">

                <!-- List -->
              <div v-if="mode == 'list'">
                <div v-if="dataLoaded">
                  <div v-if="currentTest.sample_source">
                    <sample-explorer 
                      :source="currentTest.sample_source"
                      :entityType="entityType" 
                    />
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
                        <tr @click="compareId = item._id">
                          <td v-for="column in columns" :key="column.key">
                            
                            <div v-if="column.key === 'prod'" class="py-7 pr-4">
                              <google-scholar-view 
                                :id="item._id"
                                :entity-type="entityType"
                                :data="prodResults[item._id]"
                                :highlightTest="currentTest"
                                :highlightTestValue="getTestValue(currentTest, prodResults[item._id], matches[item._id], 'prod')"
                                @title-click="compareId = item._id" />
                            </div>

                            <div v-else-if="column.key === 'walden'" class="py-7 pr-4">
                              <google-scholar-view 
                                :id="item._id" 
                                :entity-type="entityType"
                                :data="waldenResults[item._id]"
                                :matches="matches[item._id]"
                                :compare-data="prodResults[item._id]" 
                                :highlightTest="currentTest"
                                :highlightTestValue="getTestValue(currentTest, waldenResults[item._id], matches[item._id], 'walden')"
                                @title-click="compareId = item._id"/>
                            </div>          
                          </td>
                        </tr>
                      </template>

                      <template v-slot:no-data>
                        <div class="mt-12 text-grey-darken-2">No {{ entityType }} to show</div>
                      </template>

                    </v-data-table>
                    <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
                    
                    <v-pagination
                      v-model="page"
                      v-if="resultsMeta"
                      :length="Math.ceil((resultsMeta.count * scaledCoverage[entityType].bothExact) / 20)"
                      :total-visible="10"
                      rounded
                      class="py-4"
                    ></v-pagination>
                  
                  </div>
                </div>
                <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
              </div>

              <!-- Tests  -->
              <div v-else-if="mode == 'tests' && dataLoaded">
                <tests-table v-if="testItems" :items="sortedTestItems"/>
              </div>
              <template v-else-if="mode === 'tests'">
                <v-skeleton-loader type="list-item-three-line@12"></v-skeleton-loader>
              </template>
              
              <!-- Home -->
              <div v-if="mode === 'home'">
                <div v-if="coverageItems" class="home-table-wrapper">
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
                                <v-icon :icon="entityIcons[item.type]" size="default" color="grey" class="mr-2 mb-1"></v-icon>
                                <span class="font-weight-bold" style="font-size: 16px;">{{ filters.titleCase(item.type.replace("-", " ")) }}</span>
                              </template>

                              <template v-else-if="column.key === 'missing'">
                                <div class="text-right">
                                  <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                                  <div v-else :class="{'text-red': item[column.key] > 0}">
                                    <code>{{ item[column.key] }}</code>
                                  </div>
                                </div>
                              </template>

                              <template v-else-if="column.key === 'new'">
                                <div class="text-right">
                                  <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                                  <div v-else :class="{'text-green': item[column.key] > 0}">
                                    <code>{{ item[column.key] }}</code>
                                  </div>
                                </div>
                              </template>

                              <template v-else-if="['worksCorrelation', 'citationsCorrelation'].includes(column.key)">
                                <div class="text-right">
                                  <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                                  <div v-else>
                                    <code>{{ item[column.key].toFixed(2) }}</code>
                                  </div>
                                </div>
                              </template>

                              <template v-else-if="column.key === 'failingTests'">
                                <div class="text-right">
                                  <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                                  <div v-else :class="{'text-red': item[column.key] > 0}">
                                    <code>{{ item[column.key] }}</code>
                                  </div>
                                </div>
                              </template>

                              <template v-else-if="['worksCountChange', 'citationsCountChange'].includes(column.key)">
                                <div class="text-right">
                                  <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                                  <div v-else-if="item[column.key] === '∞'">+∞</div>
                                  <div v-else>
                                    <code>
                                      {{ item[column.key] !== "-" && item[column.key] > 0 ? "+" : "" }}{{ item[column.key] }}
                                    </code>
                                  </div>
                                </div>
                              </template>

                              <template v-else-if="column.key === 'sampleSize'">
                                <div class="text-right">
                                  <div v-if="item.sampleSize === '-'" class="text-grey-darken-1">-</div>
                                  <code v-else>{{ item.sampleSize.toLocaleString() }}</code>
                                </div>
                              </template>

                            </td>
                          </tr>
                        </template>
                      </v-hover>
                    </template>
                  </v-data-table>
                </div>
                <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
              </div>
              </div>
            </v-card>
          </template>


        </v-col>
      </v-row>
    </v-container>

    <!-- Compare Work Dialog -->
    <v-dialog 
      v-if="schema"
      max-width="80vw" 
      max-height="80vh"
      :model-value="!!compareId"
      @update:model-value="(val) => { if (!val) compareId = null }"
    >
      <compare-work
        v-if="compareId"
        :id="compareId"
        :schema="schema[entityType]"
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
import { useHead } from '@unhead/vue';
import axios from 'axios';
import filters from '@/filters';
import { useLoading } from '@/stores/loading';
import { isEntityEnabled } from '@/config/featureFlags';

import { useParams } from '@/composables/useStorage';
import CompareWork from '@/components/QA/CompareWork.vue';
import GoogleScholarView from '@/components/QA/googleScholarView.vue';
import SampleExplorer from '@/components/SampleExplorer.vue';
import ScatterPlot from '@/components/QA/ScatterPlot.vue';
import TestsTable from '@/components/testsTable.vue';
import { getTestValue } from '@/qa/fieldHelpers';
import { samples } from '@/qa/samples';

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
  plotKey: {
    type: String,
    default: null,
  },
});

const route = useRoute()
const router = useRouter()
const currentRoute = ref(route.path)

const { startLoading, stopLoading } = useLoading()

const metricsUrl   = `https://metrics-api.openalex.org`;
//const metricsUrl   = `http://localhost:5006`;

const { mode, entityType, testKey, plotKey } = toRefs(props);

const schema         = ref(null);

const page                 = useParams('page', 'number', 1);
const testsSearch          = useParams('testsSearch', 'string', '');
const testSort             = useParams('testSort', 'string', 'size');
const testDirectionFilter  = useParams('testDirection', 'string', null);
const testSizeFilter       = useParams('testSize', 'string', 'all');
const testCategoryFilter   = useParams('testCategory', 'string', null);
const showTestsSearch      = ref(false);
const sampleFilter         = ref('all');
const compareId            = useParams('compareId', 'string', null);
const compareView          = useParams('compareView', 'string', 'json');

const prodResults          = reactive({});
const waldenResults        = reactive({});
const matches              = reactive({});
const resultsMeta          = ref(null);
const matchRates           = reactive({});
const coverage             = reactive({});

const matchRatesLoaded     = ref(false);
const coverageLoaded       = ref(false);
const dataLoaded           = computed(() => matchRatesLoaded.value && coverageLoaded.value);
const savedScrollPosition = ref(0);

const currentTest = computed(() => {
  if (!testKey.value || !schema.value || !schema.value[entityType.value]) { return null; }
  return schema.value[entityType.value].find(t => t.key === testKey.value);
});

const { smAndDown, mdAndDown } = useDisplay();

const titles = computed(() => {
  return {
    "entity": {
      "title": filters.titleCase(entityType.value.replace("-", " ")) + " Summary",
      "subtitle": "Explore tests and sample data from production and Walden"
    },
    "tests": {
      "title": filters.titleCase(entityType.value.replace("-", " ")) + " Tests",
      "subtitle": "Total pass rates of key tests across the full sample set"
    },
    "list": {
      "title": currentTest.value ? currentTest.value.display_name : "",
      "subtitle": (() => {
        if (!currentTest.value) return "";
        
        // Calculate percentage changed
        const sampleSize = coverage[entityType.value]?.both?.sampleSize || 0;
        const totalChanged = resultsMeta.value ? Math.round(resultsMeta.value.count) : 0;
        const percentChanged = sampleSize > 0 ? Math.round((totalChanged / sampleSize) * 100) : 0;
        
        // Get plural entity type
        const entityTypePlural = filters.pluralize(entityType.value.replace('-', ' '), 2);
        
        const baseDescription = `<span class='test-description ${testItem(currentTest.value.key)?.colorClass}'>${currentTest.value.description}</span>`;
        return `${baseDescription} in ${percentChanged}% of ${entityTypePlural}`;
      })()
    },
    "plots": {
      "title": filters.titleCase(entityType.value.replace("-", " ")) + " " + plotTypes.find(p => p.field === plotKey.value)?.title,
      "subtitle": `Scatter plots of <code>${plotTypes.find(p => p.field === plotKey.value)?.field}</code> between production and Walden`
    }
  };
});

const matchedIds = computed(() => {
  return matches ? Object.keys(matches) : [];
});

const listHeaders = computed(() => {
  const columns = [
    {title: "Classic", key: "prod", width: mdAndDown.value ? "250px" : "400px"},
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
  if (!resultsMeta.value || !currentTest.value) { return null; }

  let totalNum;
  if (currentTest.value.is_pseudo) {
    totalNum = currentTest.value.sample_source in samples ? samples[currentTest.value.sample_source].ids.length : 0;
  } else {
    totalNum = Math.round(resultsMeta.value.count);
  } 
  const pageSize = mode.value === 'plots' ? 1000 : 20;
  const startNum = ((page.value-1) * pageSize + 1).toLocaleString();
  const endNum = (Math.min(page.value * pageSize, totalNum)).toLocaleString();

  // Get sample size from coverage
  const sampleSize = coverage[entityType.value]?.both?.sampleSize || 0;
  const percentChanged = sampleSize > 0 ? Math.round((totalNum / sampleSize) * 100) : 0;
  
  // Use pluralize for proper pluralization
  const entityTypePlural = filters.pluralize(entityType.value.replace('-', ' '), totalNum);
  const entityTypeSingular = filters.pluralize(entityType.value.replace('-', ' '), 1);

  let resultsStr = `Showing ${startNum}-${endNum} of ${totalNum.toLocaleString()} changed ${entityTypePlural} (${percentChanged}% of our ${sampleSize.toLocaleString()}-${entityTypeSingular} sample)`;

  return resultsStr;
});

const testItems = computed(() => {
  if (!schema.value || !matchRates[entityType.value] || !Object.keys(matchRates[entityType.value]).length) { return null; }

  const rows = []; 
  schema.value[entityType.value].forEach(test => {
    let rate = typeof test.rate === "number" ? test.rate : matchRates[entityType.value][test.key];
    rows.push({
      ...test,
      rate: rate,
      color: test.test_type === 'bug' ? 'red' : 'green',
      colorClass: "",
      filterUrl: `/${entityType.value}/tests/${test.key}`,
    });
  });
  return rows;
});

const testItem = (testKey) => {
  if (!testItems.value) { return null; }
  return testItems.value.find(test => test.key === testKey);
};

const sortedTestItems = computed(() => {
  if (!testItems.value) { return null; }
  let items = [...testItems.value];
  
  if (testDirectionFilter.value === 'bad') {
    items = items.filter(item => item.test_type === 'bug');
  } else if (testDirectionFilter.value === 'good') {
    items =  items.filter(item => item.test_type === 'feature');
  }


  if (testCategoryFilter.value) {
    items = items.filter(item => item.category === testCategoryFilter.value);
  }

  if (testsSearch.value) {
    items = items.filter(item => [item.display_name, item.category, item.description].join(" ").toLowerCase().includes(testsSearch.value.toLowerCase()));
  }
  
  return items.sort((a, b) => {
    if (testSort.value === 'alphabetical') {
      return a.display_name.localeCompare(b.display_name);
    } else if (testSort.value === 'category') {
      return a.category.localeCompare(b.category);
    } else if (testSort.value === 'size') {
      // Sort by size (rate) descending, regardless of test type
      return b.rate - a.rate;
    }
  });
});

const testCategoryOptions = computed(() => {
  const categories = new Set();
  testItems.value.forEach(test => {
    categories.add(test.category);
  });
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
});

const testsResultsStr = computed(() => {
  if (!sortedTestItems.value) return '0 tests';
  return `${sortedTestItems.value.length} tests`;
});


const scaledCoverage = computed(() => {
  const scaled = {};
  Object.keys(coverage).forEach(entity => {
    scaled[entity] = calcScaledCoverage(coverage[entity]);
  });
  return scaled;
});

const calcScaledCoverage = (data) => {
  if (data.walden.coverage === "-" || !data.walden.count) {
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

const plotTypes = [
  {
    title: "Works Count",
    field: "works_count",
    forEntity: ["nonworks"],
  },
  {
    title: "Citations Count",
    field: "cited_by_count",
    forEntity: ["works", "nonworks"],
  },
  {
    title: "Referenced Works Count",
    field: "referenced_works_count",
    forEntity: ["works"]
  },
  {
    title: "FWCI",
    field: "fwci",
    forEntity: ["works"]
  },
  {
    title: "Countries Count",
    field: "countries_distinct_count",
    forEntity: ["works"]
  },
  {
    title: "Institutions Count",
    field: "institutions_distinct_count",
    forEntity: ["works"]
  },
  {
    title: "Locations Count",
    field: "locations_count",
    forEntity: ["works"]
  },
];

const plotData = computed(() => {

  const plots = entityType.value === "works" ? 
    plotTypes.filter(plot => plot.forEntity.includes("works")) : 
    plotTypes.filter(plot => plot.forEntity.includes("nonworks"));

  const data = [];
  plots.forEach(plot => {
    plot.data = [];
    matchedIds.value.forEach(id => {
      plot.data.push({
        id: id,
        display_name: prodResults[id].display_name,
        prod: prodResults[id][plot.field] || 0,
        walden: waldenResults[id][plot.field] || 0,
      });
    });
    data.push(plot);
  });
  return data;
});

const currentPlot = computed(() => {
  if (!resultsMeta.value) { return null; }
  return plotData.value.find(plot => plot.field === plotKey.value);
});

const plotTests = computed(() => {
  if (!testItems.value) { return null; }
  return testItems.value.filter(test => test.field === plotKey.value);
});

const handlePlotPointClick = (point) => {
  compareId.value = point.id;
};

async function fetchSchema() {
  const apiUrl = `${metricsUrl}/schema?sample=${sampleFilter.value}`;
  const response = await axios.get(apiUrl);
  schema.value = response.data.tests_schema;
}

const clearResponsesData = () => {
  // Clear existing data safely
  prodResults && Object.keys(prodResults).forEach(key => delete prodResults[key]);
  waldenResults && Object.keys(waldenResults).forEach(key => delete waldenResults[key]);
  matches && Object.keys(matches).forEach(key => delete matches[key]);
  resultsMeta.value = null;
}

async function fetchMetricsResponses() {
  startLoading();
  try {
    clearResponsesData();
    let testFilter = "";
    if (currentTest.value) {
      testFilter = `&filterTest=${currentTest.value.key}`;
    }

    const perPage = mode.value === 'plots' ? 1000 : 20;
    const apiUrl = `${metricsUrl}/responses/${entityType.value}?page=${page.value}${testFilter}&per_page=${perPage}&sample=${sampleFilter.value}`;
    const response = await axios.get(apiUrl);

    response.data.results.forEach((item) => {
      prodResults[item.id] = item.prod;
      waldenResults[item.id] = item.walden;
      matches[item.id] = item.match;
    });
    resultsMeta.value = response.data.meta;
  } finally {
    stopLoading();
  }
}

async function fetchMatchRates() {
  matchRatesLoaded.value = false;
  matchRates && Object.keys(matchRates).forEach(key => delete matchRates[key]);
  const apiUrl = `${metricsUrl}/match-rates?sample=${sampleFilter.value}`;
  const response = await axios.get(apiUrl);
  Object.keys(response.data.data).forEach(key => {
    matchRates[key] = response.data.data[key];
  });
  matchRatesLoaded.value = true;
}

async function fetchCoverage() {
  coverageLoaded.value = false;
  coverage && Object.keys(coverage).forEach(key => delete coverage[key]);
  const apiUrl = `${metricsUrl}/coverage?sample=${sampleFilter.value}`;
  const response = await axios.get(apiUrl);
  Object.keys(response.data.data).forEach(key => {
    coverage[key] = response.data.data[key];
  });
  coverageLoaded.value = true;
  addPseudoTests();
}

const addPseudoTests = () => {
  Object.keys(schema.value).forEach(entity => {
    schema.value[entity] = schema.value[entity].filter(test => !test.is_pseudo);
    
    schema.value[entity].push({
      "display_name": "New " + filters.titleCase(entity.replace("-", " ")),
      "key": "new_" + entity,
      "test_type": "feature",
      "category": "other",
      "is_pseudo": true,
      "sample_source": entity + "WaldenOnly",
      "rate": 100 - coverage[entity]["walden"]["coverage"],
      "description": `${filters.titleCase(entity.replace("-", " "))} that are in Walden but not in prod` 
    });
    schema.value[entity].push({
      "display_name": "Lost " + filters.titleCase(entity.replace("-", " ")),
      "key": "lost_" + entity,
      "test_type": "bug",
      "category": "other",
      "is_pseudo": true,
      "sample_source": entity + "ProdOnly",
      "rate": 100 - coverage[entity]["prod"]["coverage"],
      "description": `${filters.titleCase(entity.replace("-", " "))} that are in prod but not in Walden`,
    });
  });  
};

const entityIcons = {
  authors: "mdi-account-outline",
  awards: "mdi-trophy-outline",
  continents: "mdi-earth",
  countries: "mdi-earth",
  concepts: "mdi-lightbulb-outline",
  domains: "mdi-tag-outline",
  fields: "mdi-tag-outline",
  funders: "mdi-cash-multiple",
  "institution-types": "mdi-shape-outline",
  institutions: "mdi-town-hall",
  keywords: "mdi-tag-outline",
  languages: "mdi-translate",
  licenses: "mdi-lock-open-outline",
  publishers: "mdi-domain",
  sdgs: "mdi-sprout-outline",
  "source-types": "mdi-shape-outline",
  sources: "mdi-book-open-outline",
  subfields: "mdi-tag-outline",
  topics: "mdi-tag-outline",
  "work-types": "mdi-shape-outline",
  works: "mdi-file-document-outline"
};

useHead({
  title: computed(() => {
    if (!titles.value[mode.value]) { return 'OpenAlex Oreo'; }
    return titles.value[mode.value].title.replace(":", "");
  }),
});

onMounted(async () => {
  await fetchSchema();
  fetchMatchRates();
  fetchCoverage();
  fetchMetricsResponses();
});

watch(page, async () => {
  await fetchMetricsResponses();
});

watch(testKey, async () => {
  await fetchMetricsResponses();
});

watch(mode, async (to, from) => {
  if (to === "plots") {
    await fetchMetricsResponses();
  }
  if (to === "tests" && testsSearch.value) {
    showTestsSearch.value = true;
  } else {
    showTestsSearch.value = false;
  }
});

watch(plotKey, async () => {
  if (plotKey.value && mode.value === "plots") {
    await fetchMetricsResponses();
  }
});

watch(entityType, async () => {
  await fetchSchema();
  await fetchMatchRates();
  await fetchCoverage();
  await fetchMetricsResponses();
});

watch(showTestsSearch, () => {
  if (showTestsSearch.value) {
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder="Search tests"]');
      if (searchInput) {
        searchInput.focus();
      }
    }, 500);
  }
});

watch(() => route.path, (newPath) => {
  currentRoute.value = newPath;
});

// Watch compareId to handle scroll preservation
watch(() => compareId.value, (newVal, oldVal) => {
  if (typeof window !== 'undefined') {
    if (newVal && !oldVal) {
      // Dialog opening - save current scroll position
      savedScrollPosition.value = window.scrollY;
    } else if (!newVal && oldVal) {
      // Dialog closing - restore scroll position
      setTimeout(() => {
        window.scrollTo(0, savedScrollPosition.value);
      }, 50); // Longer delay to ensure useParams finishes first
    }
  }
});

</script>


<style scoped>
:deep(.v-number-input input) {
  text-align: center;
}
:deep(.results-table thead tr th) {
  border-bottom: 1px solid #E0E0E0 !important;
  white-space: nowrap;
}
:deep(.results-table tbody tr) {
  cursor: pointer;
}
:deep(.results-table tbody tr:hover) {
  background-color: #F5F5F5;
}
.results-table td a {
  color: #555;
  text-decoration: none;
}
.results-table td a:hover {
  color: #555;
  text-decoration: underline;
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
.entity-metric {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}
.entity-metric-value {
  font-weight: bold;
  font-size: 24px;
}
.entity-metric.big .entity-metric-value {
  font-size: 36px;
}
.entity-metric-label {
  font-size: 11px;
  color: #555;
  text-transform: uppercase;
  color: #757575;
  letter-spacing: 1px;
}
.entity-metric.big .entity-metric-label {
  font-size: 14px;
}
.plot-nav {
 padding-top: 22px; 
 width: 200px !important;
}
.plot-nav-title {
  padding-inline-start: 24px !important;
}
.plot-nav-title .v-list-item-title {
  color: #757575;
  font-weight: bold;
}
.plot-nav-item {
  padding-inline-start: 24px !important;
  border-top-right-radius: 9999px !important;
  border-bottom-right-radius: 9999px !important;
}
.sample-page-select {
  width: 170px;
}
.related-tests-title {
  font-size: 14px;
  border-bottom: 1px solid #E0E0E0;
  padding-left: 20px;
  padding-bottom: 10px;
}
.v-card, .v-overlay {
  overflow: visible !important;
}
code {
  font-family: monospace !important;
}
</style>