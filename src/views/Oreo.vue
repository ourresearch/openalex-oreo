<template>
  <div :class="['bg-color py-0 py-sm-12', mode]" style="min-height: 70vh;">
    <v-container :fluid="smAndDown" :class="['pa-0', 'pa-sm-4']">
      <v-row>
        <v-col cols="12">
          <div class="ml-2">
            <v-breadcrumbs v-if="breadcrumbs" :items="breadcrumbs" divider="›" class="px-0 mt-n10" />
            <div class="text-h3 mb-3">
              {{ titles[mode].title }}
              <template v-if="mode === 'works'">
                <v-btn-toggle v-model="entityView" class="ml-2" color="grey-lighten-5" density="compact" rounded="pill">
                  <v-btn value="prod">Prod-only</v-btn>
                  <v-btn value="both">Both</v-btn>
                  <v-btn value="walden">Walden-only</v-btn>
                </v-btn-toggle>
              </template>
            </div>
            <div class="text-grey-darken-3 text-subtitle-1 mb-8">
              {{ titles[mode].subtitle }}
            </div>
          </div>

          <!-- Works Filters -->
          <div v-if="mode === 'works' && filterFailing.length > 0 && entityView === 'both'" class="pt-0 pb-4">
            <v-chip v-for="filter in filterFailing" :key="filter" class="mr-1" variant="tonal" rounded="pill" color="blue-darken-1">
              Failing: <code class="ml-1">{{ filter }}</code>
              <v-icon icon="mdi-close" class="ml-1" @click="filterFailing = filterFailing.filter((key) => key !== filter)"></v-icon>
            </v-chip>
          </div>

          <!-- Summary Sort -->
          <div v-if="mode === 'summary'" class="pt-0 pb-4">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal">
                  Sort:
                  {{ summarySort === 'alphabetical' ? 'Alphabetical' : 'Pass Rate' }}
                  <v-icon icon="mdi-menu-down"></v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="summarySort = 'alphabetical'">
                  <v-icon icon="mdi-check" :color="summarySort === 'alphabetical' ? 'grey-darken-2' : 'white'"></v-icon>
                  Alphabetical
                </v-list-item>
                <v-list-item @click="summarySort = 'passRate'">
                  <v-icon icon="mdi-check" :color="summarySort === 'passRate' ? 'grey-darken-2' : 'white'"></v-icon>
                  Pass %
                </v-list-item>
              </v-list>
            </v-menu>
          </div>


          <v-card flat class="pt-2 pb-0 px-4 rounded-o" style="overflow: hidden !important;">

            <!-- Skeleton Loader -->
            <v-skeleton-loader 
              v-if="matchedIds.length === 0" 
              :type="mode === 'works' ? 'table' : 'list-item-three-line@12'" 
              class="mt-8"
            />

            <!-- Results -->
            <div v-else-if="matchedIds.length > 0" class="mx-n4 results-section">
              <v-tabs 
                v-model="currentRoute"
                v-if="(mode === 'works' && entityView === 'both') || mode === 'summary'" 
                bg-color="grey-lighten-3"
                class="mb-4 mt-n2">
                <v-tab :to="`/entity/${entityType}/tests`" value="`/entity/${entityType}/tests`" class="text-uppercase text-grey-darken-2">Tests</v-tab>
                <v-tab :to="`/entity/${entityType}/list`" value="`/entity/${entityType}/list`" class="text-uppercase text-grey-darken-2">List</v-tab>
              </v-tabs>

              <!-- Works -->
              <div v-if="mode == 'works'" ref="tableScrollRef" class="table-scroll">
                <div v-if="entityView === 'both'">
                  
                  <div class="px-4 pt-2 pb-0 text-grey-darken-2">
                    <div v-if="resultsMeta" class="text-caption">
                      {{ ((page-1)*pageSize+1).toLocaleString() }}-{{ Math.min(page*pageSize, resultsMeta.count).toLocaleString() }} of 
                      {{ resultsMeta.count.toLocaleString() }} results 
                      ({{ Math.round(resultsMeta.count / resultsMeta.sample_size * 100) }}%)
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
                        <th v-for="column in columns" :key="column.key" :style="{width: column.width}" :class="{'icon-column': column.key in fieldIcons, 'spacer-column': column.key === 'spacer'}">
                          <span v-if="fieldIcons[column.key]">
                            <v-menu location="bottom left">
                              <template #activator="{ props: menuProps }">
                                <v-icon size="default" :color="filterFailing.includes(column.key) ? 'red-lighten-2' : 'grey-darken-2'" v-bind="menuProps" :icon="fieldIcons[column.key]"></v-icon>
                              </template>
                              <v-card class="pa-0">
                                <v-list-item>
                                  <div class="d-flex">
                                    <v-icon size="default" class="mr-1" color="grey-darken-1" :icon="fieldIcons[column.key]"></v-icon>
                                    <div>
                                      <code>{{ column.key }}</code>
                                      <v-chip class="mx-1" size="small" color="grey-darken-1">{{ testOnField(column.key) }}</v-chip>
                                      <div class="text-grey-darken-1 text-caption">Pass rate: {{ matchRates[entityType][column.key] }}%</div>
                                    </div>
                                  </div>
                                </v-list-item>
                                <v-divider class="my-2"></v-divider>
                                <v-list-item @click="filterFailing = filterFailing.filter((key) => key !== column.key)">
                                  <v-icon :color="filterFailing.includes(column.key) ? 'white' : 'grey'" icon="mdi-check" class="mr-1"></v-icon>
                                  No filter
                                </v-list-item>
                                <v-list-item @click="filterFailing = [...new Set([...filterFailing, column.key])]">
                                  <v-icon :color="filterFailing.includes(column.key) ? 'grey' : 'white'" icon="mdi-check" class="mr-1"></v-icon>
                                  Filter by failing
                                </v-list-item>
                                <v-divider class="my-2"></v-divider>
                                <v-list-item @click="fieldsToShow = fieldsToShow.filter((key) => key !== column.key)">
                                  <v-icon color="grey-darken-1" icon="mdi-eye-off" class="mr-1"></v-icon>
                                  Hide column
                                </v-list-item>
                              </v-card>
                            </v-menu>
                          </span>
                          <span v-else-if="column.key === 'spacer'">
                            <!-- Tests Menu -->
                            <v-dialog max-width="900" v-model="showTestsDialog">
                              <template #activator="{ props }">
                                <v-btn icon size="x-small" color="grey-lighten-2" class="my-2" v-bind="props">
                                  <v-icon icon="mdi-plus"></v-icon>
                                </v-btn>
                              </template>
                              <v-card rounded="xl" class="pa-4">
                                <v-card-title class="d-flex justify-space-between align-start w-100">
                                  <div style="flex: 1; min-width: 0; margin-right: 16px;">
                                    Tests to show
                                  </div>
                                  <v-btn icon variant="text" class="mr-n4 mt-n2" style="flex-shrink: 0;" @click="showTestsDialog = false">
                                    <v-icon color="grey-darken-2">mdi-close</v-icon>
                                  </v-btn>
                                </v-card-title>
                                <v-card-text>
                                <div>
                                  <v-chip 
                                    v-for="field in defaultFields[entityType]" 
                                    :key="field"
                                    :variant="fieldsToShow.includes(field) ? 'tonal' : 'flat'"
                                    :color="fieldsToShow.includes(field) ? 'blue-darken-3' : 'white'"
                                    :style="fieldsToShow.includes(field) ? '' : 'border: 1px solid #DCE4ED;'"
                                    class="mr-2 mb-3"
                                    @click="toggleField(field)"
                                  >
                                    {{ field }}
                                    <v-icon v-if="fieldsToShow.includes(field)" icon="mdi-close" class="mr-n1" end></v-icon>
                                  </v-chip>
                                </div>
                                <div class="mt-2">
                                  <span class="text-caption text-grey-darken-2 mr-1">Reset:</span>
                                  <v-btn
                                    variant="flat"
                                    color="grey-lighten-2"
                                    size="default"
                                    class="mr-2"
                                    rounded
                                    @click="fieldsToShow = [...defaultFields[entityType]]"
                                  >
                                    <v-icon icon="mdi-select-group"></v-icon>
                                    All
                                  </v-btn>                      
                                  
                                  <v-btn
                                    variant="flat"
                                    color="grey-lighten-2"
                                    size="default"
                                    rounded
                                    @click="fieldsToShow = []"
                                  >
                                    <v-icon icon="mdi-select"></v-icon>
                                    None
                                  </v-btn>
                                </div>
                                <div>
                                  <v-switch
                                    v-model="showProdColumn"
                                    label="Show production column"
                                    color="blue"
                                    hide-details
                                    class="mt-2"
                                  ></v-switch>
                                </div>
                              </v-card-text>
                              </v-card>
                            </v-dialog>
                          </span>
                          <span v-else>{{ column.title }}</span>
                        </th>
                      </tr>
                    </template>

                    <!-- Table Rows -->
                    <template v-slot:item="{ item, columns }">
                      <tr>
                        <td v-for="column in columns" :key="column.key" :class="{'icon-column': column.key in fieldIcons}" :style="getCellStyle(item, column)">
                          
                          <div v-if="column.key === 'prod'" class="py-7 px-0" style="width: 370px;">
                            <google-scholar-view 
                              :id="item._id" 
                              :data="prodResults[item._id]"
                              @title-click="compareId = item._id" />
                          </div>

                          <div v-else-if="column.key === 'walden'" class="py-7 px-0" style="width: 370px;">
                            <google-scholar-view 
                              :id="item._id" 
                              :data="waldenResults[item._id]"
                              :matches="matches[item._id]"
                              :compare-data="prodResults[item._id]" 
                              @title-click="compareId = item._id"/>
                          </div>

                          <v-tooltip v-else open-delay="300" :text="column.key">
                            <template v-slot:activator="{ props }">
                              <div class="test-cell" @click="openCompareFieldDialog(item._id, column.key)" style="width: 100%; height: 100%; cursor: pointer;" v-bind="props"></div>
                            </template>
                          </v-tooltip>
        
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                </div>

                <div v-else-if="entityView === 'prod'">
                  <sample-explorer source="prod-only" />
                </div>

                <div v-else-if="entityView === 'walden'">
                  <sample-explorer source="xpac" />
                </div>
              </div>

              <!-- Summary  -->
              <div v-else-if="mode == 'summary'">
                <v-row class="pa-4">
                  <template v-if="summaryItems">
                    
                    <v-col cols="12" md="6" lg="4" xl="3" v-for="summaryCard in sortedSummaryItems" :key="summaryCard.fieldName">
                      <v-card flat color="grey-lighten-4 pa-3" rounded="xl" class="fill-height">
                        <RouterLink :to="`/entity/${entityType}/list?filterFailing=${summaryCard.fieldName}&entityView=both`" custom v-slot="{ navigate }">
                          <div class="d-flex cursor-pointer" @click="navigate">
                            <div class="flex-shrink-0 mr-2 d-flex align-center">
                              <v-progress-circular size="40" width="8" color="blue-grey" :model-value="summaryCard.passRate"></v-progress-circular>
                            </div>
                            <div>
                              <v-tooltip v-if="summaryCard.fieldName !== centerEllipsis(summaryCard.fieldName)" :text="`${summaryCard.fieldName}`" location="bottom">
                                <template v-slot:activator="{ props }">
                                  <code class="d-block" v-bind="props">{{ centerEllipsis(summaryCard.fieldName) }}</code>
                                </template>
                              </v-tooltip>
                              <code v-else class="d-block">{{ summaryCard.fieldName }}</code>
                              <span class="ml-1 text-grey-darken-1" size="x-small">{{ summaryCard.passRate }}%</span>
                              <v-chip v-if="testOnField(summaryCard.fieldName)" class="ml-1" size="x-small" color="grey-darken-2">{{ testOnField(summaryCard.fieldName) }}</v-chip>
                            </div>
                          </div>
                        </RouterLink>
                      </v-card>
                    </v-col>
                  </template>
                  <template v-else>
                    <v-skeleton-loader type="list-item-three-line@12"></v-skeleton-loader>
                  </template>
                </v-row>  
              </div>

              <!-- Coverage -->
              <div v-if="mode === 'coverage'">
                <template v-if="coverageItems">
                  <v-data-table
                    :headers="coverageHeaders"
                    :items="coverageItems"
                    :items-per-page="-1"
                    :hide-default-footer="true"
                    flat
                    class="metrics-table"
                  >
                    <template v-slot:item="{ item, columns }">
                      <tr>
                        <td v-for="column in columns" :key="column.key" :class="column.isLink ? 'link-cell' : ''">
                          <template v-if="column.key === 'type'">
                            <code><a :href="`https://api.openalex.org/v2/${item.type}`" target="_blank" style="text-decoration: none; color: #000;">/{{ item.type }}</a></code>
                          </template>

                          <template v-else-if="column.key === 'coverage'">
                            <cell-bar :percent="item.coverage" />
                          </template>

                          <template v-else-if="column.key === 'prodOnly'">
                            <RouterLink :to="`/entity/${item.type}/list?entityView=prod`" custom v-slot="{ navigate }">
                              <div @click="navigate" class="text-right cursor-pointer"><code>{{ item.prodOnly }}{{ item.prodOnly === '-' ? '' : '%' }}</code></div>
                            </RouterLink>
                          </template>

                          <template v-else-if="column.key === 'both'">
                            <RouterLink :to="`/entity/${item.type}/list`" custom v-slot="{ navigate }">
                              <div @click="navigate" class="text-right cursor-pointer"><code>{{ item.both }}{{ item.both === '-' ? '' : '%' }}</code></div>
                            </RouterLink>
                          </template>

                          <template v-else-if="column.key === 'waldenOnly'">
                            <RouterLink :to="`/entity/${item.type}/list?entityView=walden`" custom v-slot="{ navigate }">
                              <div @click="navigate" class="text-right cursor-pointer"><code>{{ item.waldenOnly }}{{ item.waldenOnly === '-' ? '' : '%' }}</code></div>
                            </RouterLink>
                          </template>

                          <template v-else-if="column.key === 'testPassRate'">
                            <RouterLink :to="`/entity/${item.type}/tests`" custom v-slot="{ navigate }">
                              <div @click="navigate" class="text-right cursor-pointer"><code>{{ item.testPassRate }}{{ item.testPassRate === '-' ? '' : '%' }}</code></div>
                            </RouterLink>
                          </template>

                          <template v-else-if="column.key === 'sampleSize'">
                            <div class="text-right"><code>{{ item.sampleSize.toLocaleString() }}</code></div>
                          </template>
                          <template v-else>
                            {{ item[column.key] }}
                          </template>
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                </template>
                <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
              </div>

              <!-- Pagination -->
              <v-pagination
                v-model="page"
                v-if="mode === 'works' && entityView === 'both'"
                :length="resultsMeta ? Math.ceil(resultsMeta.count / pageSize) : 0"
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
      v-if="headers.length > 0 && mode === 'works'"
      ref="fixedHeaderRef"
      class="fixed-header"
      v-show="showFixedHeader"
    >
      <table class="results-table">
        <thead>
          <tr>
            <th v-for="column in headers" :key="column.key" :style="{width: column.width}" :class="{'icon-column': column.key in fieldIcons, 'spacer-column': column.key === 'spacer'}">
              <span v-if="fieldIcons[column.key]">
                <v-menu location="bottom left">
                  <template #activator="{ props: menuProps }">
                    <v-icon size="default" :color="filterFailing.includes(column.key) ? 'red-lighten-2' : 'grey-darken-2'" v-bind="menuProps" :icon="fieldIcons[column.key]"></v-icon>
                  </template>
                  <v-card class="pa-0">
                    <v-list-item>
                      <div class="d-flex">
                        <v-icon size="default" class="mr-1" color="grey-darken-1" :icon="fieldIcons[column.key]"></v-icon>
                        <div>
                          <code>{{ column.key }}</code>
                          <v-chip class="mx-1" size="small" color="grey-darken-1">{{ testOnField(column.key) }}</v-chip>
                          <div class="text-grey-darken-1 text-caption">Pass rate: {{ matchRates[entityType][column.key] }}%</div>
                        </div>
                      </div>
                    </v-list-item>
                    <v-divider class="my-2"></v-divider>
                    <v-list-item @click="filterFailing = filterFailing.filter((key) => key !== column.key)">
                      <v-icon :color="filterFailing.includes(column.key) ? 'white' : 'grey'" icon="mdi-check" class="mr-1"></v-icon>
                      No filter
                    </v-list-item>
                    <v-list-item @click="filterFailing = [...new Set([...filterFailing, column.key])]">
                      <v-icon :color="filterFailing.includes(column.key) ? 'grey' : 'white'" icon="mdi-check" class="mr-1"></v-icon>
                      Filter by failing
                    </v-list-item>
                    <v-divider class="my-2"></v-divider>
                    <v-list-item @click="fieldsToShow = fieldsToShow.filter((key) => key !== column.key)">
                      <v-icon color="grey-darken-1" icon="mdi-eye-off" class="mr-1"></v-icon>
                      Hide column
                    </v-list-item>
                  </v-card>
                </v-menu>
              </span>
              <span v-else-if="column.key === 'spacer'">
                <!-- Tests Menu -->
                <v-dialog max-width="900" v-model="showTestsDialog">
                  <template #activator="{ props }">
                    <v-btn icon size="x-small" color="grey-lighten-2" class="my-2" v-bind="props">
                      <v-icon icon="mdi-plus"></v-icon>
                    </v-btn>
                  </template>
                  <v-card rounded="xl" class="pa-4">
                    <v-card-title class="d-flex justify-space-between align-start w-100">
                      <div style="flex: 1; min-width: 0; margin-right: 16px;">
                        Tests to show
                      </div>
                      <v-btn icon variant="text" class="mr-n4 mt-n2" style="flex-shrink: 0;" @click="showTestsDialog = false">
                        <v-icon color="grey-darken-2">mdi-close</v-icon>
                      </v-btn>
                    </v-card-title>
                    <v-card-text>
                    <div>
                      <v-chip 
                        v-for="field in defaultFields[entityType]" 
                        :key="field"
                        :variant="fieldsToShow.includes(field) ? 'tonal' : 'flat'"
                        :color="fieldsToShow.includes(field) ? 'blue-darken-3' : 'white'"
                        :style="fieldsToShow.includes(field) ? '' : 'border: 1px solid #DCE4ED;'"
                        class="mr-2 mb-3"
                        @click="toggleField(field)"
                      >
                        {{ field }}
                        <v-icon v-if="fieldsToShow.includes(field)" icon="mdi-close" class="mr-n1" end></v-icon>
                      </v-chip>
                    </div>
                    <div class="mt-2">
                      <span class="text-caption text-grey-darken-2 mr-1">Reset:</span>
                      <v-btn
                        variant="flat"
                        color="grey-lighten-2"
                        size="default"
                        class="mr-2"
                        rounded
                        @click="fieldsToShow = [...defaultFields[entityType]]"
                      >
                        <v-icon icon="mdi-select-group"></v-icon>
                        All
                      </v-btn>                      
                      
                      <v-btn
                        variant="flat"
                        color="grey-lighten-2"
                        size="default"
                        rounded
                        @click="fieldsToShow = []"
                      >
                        <v-icon icon="mdi-select"></v-icon>
                        None
                      </v-btn>
                    </div>
                    <div>
                      <v-switch
                        v-model="showProdColumn"
                        label="Show production column"
                        color="blue"
                        hide-details
                        class="mt-2"
                      ></v-switch>
                    </div>
                  </v-card-text>
                  </v-card>
                </v-dialog>
              </span>
              <span v-else>{{ column.title }}</span>
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

    <!-- Work Details Drawer -->  
    <work-drawer 
      v-model:isDrawerOpen="isDrawerOpen" 
      :workId="zoomId" 
      :workData="zoomData"
      :isV2="zoomSource === 'walden'"
      @close="onDrawerClose"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, toRefs, nextTick } from 'vue';
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify';
import axios from 'axios';

import { fieldIcons } from '@/qa/apiComparison';
import filters from "@/filters";
import { useParams } from '@/composables/useStorage';
import WorkDrawer from '@/components/QA/WorkDrawer.vue';
import CompareField from '@/components/QA/CompareField.vue';
import CompareWork from '@/components/QA/CompareWork.vue';
import GoogleScholarView from '@/components/QA/googleScholarView.vue';
import CellBar from '@/components/QA/CellBar.vue';
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
const currentRoute = ref(route.path)

const schema         = ref(null);
const defaultFields  = ref(null);

const metricsUrl   = `https://metrics-api.openalex.org/`;
//const metricsUrl   = `http://localhost:5006/`;
const axiosConfig  = {headers: {Authorization: "Bearer YWMKSvdNwfrknsOPtdqCPz"}};

const { mode, entityType } = toRefs(props);

const fieldsToShow      = useParams('fieldsToShow', 'array', []);
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
const showTestsDialog   = ref(false);

const prodResults          = reactive({});
const waldenResults        = reactive({});
const matches              = reactive({});
const resultsMeta          = ref(null);
const matchRates           = reactive({});
const coverage             = reactive({});

const tableScrollRef       = ref(null);
const fixedHeaderRef       = ref(null);
const vDataTableRef        = ref(null);
const showFixedHeader      = ref(false);

const { smAndDown } = useDisplay();

const titles = {
  "works": {
    "title": "Works",
    "subtitle": "Compare and explore works from production and Walden with key tests"
  },
  "summary": {
    "title": "Works",
    "subtitle": "Total pass rates of key tests across the full sample set"
  },
  "coverage": {
    "title": "Overview",
    "subtitle": "Explore coverage and test rates between production and Walden across all endpoints"
  },
};

const breadcrumbs = computed(() => {
  if (mode.value === "coverage") { return null; }
  const items = [
    { title: "Overview", disabled: false, to: "/" },
    { title: filters.titleCase(entityType.value), disabled: true, to: `/entity/${entityType.value}` },
  ];
  if (mode.value === "works") {
    const viewNames = {"prod": "Prod-only", "both": "Both", "walden": "Walden-only"};
    items.push({ title: "List", disabled: true, to: `/entity/${entityType.value}/list` });
    items.push({ title: viewNames[entityView.value], disabled: true, to: `/entity/${entityType.value}/list` });
  } else if (mode.value === "summary") {
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
  const fields = fieldsToShow.value.map(field => {
    return { title: fieldWithTest(field), key: field, width: "30px", align: "center" };
  });
  fields.unshift({title: "Walden", key: "walden", width: "400px", align: "left"});
  if (showProdColumn.value) { fields.unshift({title: "Prod", key: "prod", width: "400px", align: "left"}); }
  fields.push({title: " ", key: "spacer", width: "50px", align: "center"});
  return fields;
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

  fieldsToShow.value.map(field => {    
    row[field] = " ";
  });
  //console.log(row);
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
    });
  });
  return rows;
});

const sortedSummaryItems = computed(() => {
  const items = [...summaryItems.value];
  return items.sort((a, b) => {
    if (summarySort.value === 'alphabetical') {
      return a.fieldName.localeCompare(b.fieldName);
    } else {
      return b.passRate - a.passRate;
    }
  });
});

const centerEllipsis = (str) => {
  const maxLen = 26;
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
      title: 'Prod Only', 
      key: 'prodOnly',
      align: 'end',
      width: "140px",
      isLink: true,
      sortable: true,
    },
    { 
      title: 'Both', 
      key: 'both',
      align: 'end',
      width: "140px",
      isLink: true,
      sortable: true,
    },
    { 
      title: 'Walden Only', 
      key: 'waldenOnly',
      align: 'end',
      width: "140px",
      isLink: true,
      sortable: true,
    },
    { 
      title: 'Test Pass', 
      key: 'testPassRate',
      align: 'end',
      isLink: true,
      sortable: true,
    },
    { 
      title: 'Sample Size', 
      key: 'sampleSize',
      align: 'end',
      width: "200px",
      sortable: true,
    },
  ];
});

const coverageItems = computed(() => {
  if (!Object.keys(coverage).length) { return null; }
  const rows = []; 
  Object.keys(coverage).forEach(entity => {
    let scaledCoverage = calcScaledCoverage(coverage[entity]);
    rows.push({
      type: entity,
      prodOnly: scaledCoverage.prodOnly,
      both: scaledCoverage.both,
      waldenOnly: scaledCoverage.waldenOnly,
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

const calcScaledCoverage = (data) => {
  if (data.walden.coverage === "-") {
    return {
      prodOnly: 100 - data.prod.coverage,
      waldenOnly: "-",
      both: data.prod.coverage,
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
  };
};

const toggleField = (field) => {
  if (fieldsToShow.value.includes(field)) {
    fieldsToShow.value = fieldsToShow.value.filter(f => f !== field);
  } else {
    fieldsToShow.value = [...fieldsToShow.value, field];
  }
}

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
  fieldsToShow.value = fieldsToShow.value.length > 0 ? fieldsToShow.value : [...response.data.testFields[entityType.value]];
}

async function fetchMatchRates() {
  const apiUrl = `${metricsUrl}/match-rates`;
  const response = await axios.get(apiUrl);
  Object.keys(response.data.data).forEach(key => {
    matchRates[key] = response.data.data[key];
  });
  console.log("Fetched match rates")
  console.log(matchRates);
}

async function fetchCoverage() {
  const apiUrl = `${metricsUrl}/coverage`;
  const response = await axios.get(apiUrl);
  Object.keys(response.data.data).forEach(key => {
    coverage[key] = response.data.data[key];
  });
  console.log("Fetched coverage")
  console.log(coverage);
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
.results-section {
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
.v-card, .v-overlay {
  overflow: visible !important;
}
.link-cell {
  cursor: pointer;
}
.link-cell:hover {
  background-color: #E0E0E0;
}
</style>