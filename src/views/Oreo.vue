<template>
  <div :class="['bg-color py-0 py-sm-12', mode]" style="min-height: calc(100vh - 70px);">
    <v-container :fluid="smAndDown" :class="['pa-0', 'pa-sm-4']">
      <v-row>

        <!-- Main Content -->
        <v-col cols="12">
          
          <!-- Title, Subtitle, Breadcrumbs -->
          <div>
            <v-breadcrumbs v-if="breadcrumbs" :items="breadcrumbs" divider="›" class="px-0 mt-n10" />
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="d-flex align-center mb-2">
                  <v-icon 
                    v-if="currentTest" 
                    :icon="currentTest.test_type === 'bug' ? 'mdi-bug' : 'mdi-rocket'" 
                    size="46" 
                    :color="testItem(currentTest.key)?.color"
                  ></v-icon>
                  <span class="text-h3">
                    {{ titles[mode].title }}
                  </span>
                </div>
                <!-- Subtitle -->
                <div class="mb-8">
                  <span class="text-grey-darken-3 text-subtitle-1" v-html="titles[mode].subtitle"></span>
                  <v-chip 
                    v-if="mode === 'list' && currentTest"
                    color="grey-darken-2"
                    variant="tonal"
                    size="small"
                    class="ml-1"
                    @click="router.push(`/${entityType}/tests?testCategory=${currentTest.category}`)"
                  >
                    {{ currentTest.category }}
                  </v-chip>
                </div>
              </div>

              <!-- Tests Search -->
              <div v-if="mode === 'tests'">
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
                    rounded="pill"
                    density="comfortable"
                    class="mb-2"
                    style="width: 250px;"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Search tests"
                  ></v-text-field>
                </v-slide-x-reverse-transition>
              </div>

              <!-- Test Rate -->
              <div v-if="mode === 'list' && currentTest" class="d-flex align-center">
                <v-progress-circular 
                  size="50" 
                  width="10" 
                  :color="testItem(currentTest.key)?.color"
                  :model-value="testItem(currentTest.key)?.rate">
                </v-progress-circular>
                <span class="ml-2 font-weight-bold" style="font-size: 46px;">
                  {{ testItem(currentTest.key)?.rate }}%
                </span>
              </div>

              <!-- Entity Metrics-->
              <div v-if="mode === 'entity' && dataLoaded" class="mx-4">
                <div class="text-right" >
                  <span class="entity-metric">
                    <span class="entity-metric-value" :class="{'text-red': coverageItem(entityType).missing > 0}">{{ coverageItem(entityType).missing }}%</span>
                    <span class="entity-metric-label ml-1">Missing</span>
                  </span>

                  <span class="entity-metric">
                    <span class="entity-metric-value" :class="{'text-green': coverageItem(entityType).new > 0}">{{ coverageItem(entityType).new }}%</span>
                    <span class="entity-metric-label ml-1">New</span>
                  </span>

                  <span class="entity-metric">
                    <span class="entity-metric-value" :class="{'text-red': coverageItem(entityType).failingTests > 0}">{{ coverageItem(entityType).failingTests }}</span>
                    <span class="entity-metric-label ml-1">Failing Tests</span>
                  </span>

                  <span class="entity-metric" v-if="coverageItem(entityType).worksCountChange !== '-'">
                    <span class="entity-metric-value" :class="{'text-red': coverageItem(entityType).worksCountChange < 0, 'text-green': coverageItem(entityType).worksCountChange > 0}">
                      {{ !(coverageItem(entityType).worksCountChange < 0) ? "+" : "" }}{{ coverageItem(entityType).worksCountChange }}%
                    </span>
                    <span class="entity-metric-label ml-1">Works</span>
                  </span>

                  <span class="entity-metric" v-if="coverageItem(entityType).citationsCountChange !== '-'">
                    <span class="entity-metric-value" :class="{'text-red': coverageItem(entityType).citationsCountChange < 0, 'text-green': coverageItem(entityType).citationsCountChange > 0}">
                      {{ !(coverageItem(entityType).citationsCountChange <= 0) ? "+" : "" }}{{ coverageItem(entityType).citationsCountChange }}%
                    </span>
                    <span class="entity-metric-label ml-1">Citations</span>
                  </span>
                </div>
              </div>

              <!-- Plot Correlation-->
              <div v-if="mode === 'plots' && dataLoaded" class="mx-4">
                <div class="text-right" >
                  <span class="entity-metric big">
                    <span class="entity-metric-value">{{ coverage[entityType]["correlations"][plotKey] ? coverage[entityType]["correlations"][plotKey].toFixed(2) : '-' }}</span>
                    <span class="entity-metric-label ml-1">Correlation</span>
                  </span>
                </div>
              </div>

            </div>
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
            <div class="mb-1 d-flex">
              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-if="testDirectionFilter === 'all'" v-bind="props" rounded="pill" color="grey-darken-2" variant="outlined" style="border: 1px solid #BDBDBD;" class="mr-1">
                    Direction
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                  <v-chip v-else v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal" class="mr-1">
                    Direction: <b class="ml-1">{{ filters.titleCase(testDirectionFilter) }}</b>
                    <v-icon icon="mdi-close" @click.stop="testDirectionFilter = 'all'"></v-icon>
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item @click="testDirectionFilter = 'all'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testDirectionFilter === 'all' ? '' : 'opacity-0']"></v-icon>
                      All
                    </div>
                  </v-list-item>
                  <v-list-item @click="testDirectionFilter = 'better'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testDirectionFilter === 'better' ? '' : 'opacity-0']"></v-icon>
                      Better
                    </div>
                  </v-list-item>
                  <v-list-item @click="testDirectionFilter = 'worse'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testDirectionFilter === 'worse' ? '' : 'opacity-0']"></v-icon>
                      Worse
                      <v-spacer></v-spacer>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-if="testSizeFilter === 'all'" v-bind="props" rounded="pill" color="grey-darken-2" variant="outlined" style="border: 1px solid #BDBDBD;" class="mr-1">
                    Size
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                  <v-chip v-else v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal" class="mr-1">
                    Size: <b class="ml-1">{{ filters.titleCase(testSizeFilter) }}</b>
                    <v-icon icon="mdi-close" @click.stop="testSizeFilter = 'all'"></v-icon>
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item @click="testSizeFilter = 'all'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSizeFilter === 'all' ? '' : 'opacity-0']"></v-icon>
                      All
                    </div>
                  </v-list-item>
                  <v-list-item @click="testSizeFilter = 'small'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSizeFilter === 'small' ? '' : 'opacity-0']"></v-icon>
                      Small
                    </div>
                  </v-list-item>
                  <v-list-item @click="testSizeFilter = 'big'">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSizeFilter === 'big' ? '' : 'opacity-0']"></v-icon>
                      Big
                      <v-spacer></v-spacer>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu width="200">
                <template v-slot:activator="{ props }">
                  <v-chip v-if="testCategoryFilter === 'all'" v-bind="props" rounded="pill" color="grey-darken-2" variant="outlined" style="border: 1px solid #BDBDBD;" class="mr-1">
                    Category
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-chip>
                  <v-chip v-else v-bind="props" rounded="pill" color="blue-darken-1" variant="tonal" class="mr-1">
                    Category: <b class="ml-1">{{ filters.titleCase(testCategoryFilter) }}</b>
                    <v-icon icon="mdi-close" @click.stop="testCategoryFilter = 'all'"></v-icon>
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
                    {{ filters.titleCase(testSort) }}
                    <v-icon icon="mdi-menu-down"></v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="testSort = 'size'">
                    <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSort === 'size' ? '' : 'opacity-0']"></v-icon>
                    Size
                  </v-list-item>
                  <v-list-item @click="testSort = 'category'">
                    <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSort === 'category' ? '' : 'opacity-0']"></v-icon>
                    Category
                  </v-list-item>
                  <v-list-item @click="testSort = 'alphabetical'">
                    <v-icon icon="mdi-check" color="grey-darken-2" :class="['mr-2', testSort === 'alphabetical' ? '' : 'opacity-0']"></v-icon>
                    Alphabetical
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
                      rounded="xl" 
                      v-bind="props" 
                      :class="isHovering ? 'bg-blue-lighten-5' : 'bg-grey-lighten-3'"
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
            <div v-if="resultsMeta" class="text-center">
              <v-card flat rounded="xl" class="py-8 mb-10 d-flex align-start">
                <v-list class="text-left pt-12 mr-2" style="width: 180px">
                  <v-list-item v-for="plot in plotData" :key="plot.field" :to="`/${entityType}/plots/${plot.field}`" class="plot-nav-item">
                    <v-list-item-title>{{ plot.title.replace(' Count', '') }}</v-list-item-title>
                  </v-list-item>
                </v-list>
                <scatter-plot
                  :title="currentPlot.title"
                  @click-point="handlePlotPointClick"
                  :data="currentPlot.data"
                />
              </v-card>
            </div>
            <v-card v-else flat rounded="xl" class="text-center" style="height: 600px; overflow: hidden !important;">
              <v-progress-linear color="blue" class="" indeterminate></v-progress-linear>
              <div style="font-size: 14px; color: #777; margin-top: 280px; font-style: italic;">Loading...</div>
            </v-card>
          </div>


          <v-card v-else flat class="pb-0 px-4 rounded-o" style="overflow: hidden !important;">

            <!-- Results -->
            <div class="mx-n4 results-section">

              <!-- List -->
              <div v-if="mode == 'list'">
                <v-col cols="12" v-if="dataLoaded">
                  <div v-if="currentTest.sample_source">
                    <sample-explorer 
                      :source="currentTest.sample_source"
                      :entityType="entityType" 
                      :fractionToShow="currentTest.sample_source.includes('prod-only') ? scaledCoverage[entityType].prodOnlyExact : scaledCoverage[entityType].waldenOnlyExact"
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
                    </v-data-table>
                    <v-skeleton-loader v-else type="list-item-three-line@12"></v-skeleton-loader>
                    
                    <v-pagination
                      v-model="page"
                      v-if="resultsMeta"
                      :length="Math.ceil((resultsMeta.count * scaledCoverage[entityType].bothExact) / pageSize)"
                      :total-visible="10"
                      rounded
                      class="py-4"
                    ></v-pagination>
                  
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
                          :class="[isHovering ? 'bg-grey-lighten-3' : '', 'cursor-pointer', 'row-is-link']" 
                          v-ripple 
                          @click="router.push(item.filterUrl)"
                        >
                          <td v-for="column in columns" :key="column.key" :style="{width: column.width || 'auto'}" :class="column.tight ? 'px-1' : ''">
                                             
                            <RouterLink
                              v-if="column.key === 'donut'"
                              :to="item.filterUrl"
                              class="row-link-overlay"
                            />

                            <template v-if="column.key === 'donut'">
                              <v-progress-circular 
                                size="24" 
                                width="10" 
                                :color="item.color" 
                                :model-value="item.rate">
                              </v-progress-circular>
                            </template>

                            <template v-if="column.key === 'rate'">
                              <div class="text-right">
                                <code>{{ item.rate }}%</code>
                              </div>
                            </template>

                            <template v-if="column.key === 'type'">
                              <v-icon :icon="item.test_type === 'bug' ? 'mdi-bug' : 'mdi-rocket-launch'" :color="item.color" />
                            </template>

                            <template v-else-if="column.key === 'display_name'">
                              <span class="font-weight-medium">{{ item.display_name }}</span>
                            </template>

                            <template v-else-if="column.key === 'category'">
                            </template>

                            <template v-else-if="column.key === 'description'">
                              <v-chip color="grey-darken-2" variant="tonal" size="small" rounded="sm" class="mr-2" @click.stop="testCategoryFilter = item.category">{{ item.category }}</v-chip>
                              <span :class="item.colorClass" class="test-description" v-html="item.description"></span>
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
                <v-col v-if="coverageItems" cols="12" lg="11" xl="7">
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
                                  <div v-else-if="item[column.key] === '∞'" class="text-green">+∞</div>

                                  <div v-else :class="{'text-red': item[column.key] < 0, 'text-green': item[column.key] > 0}">
                                    <code>
                                      {{ item[column.key] !== "-" && item[column.key] > 0 ? "+" : "" }}{{ item[column.key] }}
                                    </code>
                                </div>
                                </div>
                              </template>

                              <template v-else-if="column.key === 'sampleSize'">
                                <div class="text-right"><code>{{ item.sampleSize.toLocaleString() }}</code></div>
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

            </div>
          </v-card>

        </v-col>
      </v-row>
    </v-container>

    <!-- Compare Work Dialog -->
    <v-dialog 
      v-if="schema"
      max-width="80vw" 
      max-height="80vh"
      :model-value="!!compareId"
      scroll-strategy="block"
      teleport="body"
      class="rounded-o"
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
import { ref, reactive, computed, watch, onMounted, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify';
import axios from 'axios';

import filters from "@/filters";
import { useParams } from '@/composables/useStorage';
import CompareWork from '@/components/QA/CompareWork.vue';
import GoogleScholarView from '@/components/QA/googleScholarView.vue';
import SampleExplorer from '@/components/SampleExplorer.vue';
import ScatterPlot from '@/components/QA/ScatterPlot.vue';
import { getTestValue } from '@/qa/fieldHelpers';

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

const metricsUrl   = `https://metrics-api.openalex.org`;
//const metricsUrl   = `http://localhost:5006`;

const { mode, entityType, testKey, plotKey } = toRefs(props);

const schema         = ref(null);

const pageSize             = useParams('pageSize', 'number', 20);
const page                 = useParams('page', 'number', 1);
const testsSearch          = useParams('testsSearch', 'string', '');
const testSort             = useParams('testSort', 'string', 'size');
const testDirectionFilter  = useParams('testDirection', 'string', 'all');
const testSizeFilter       = useParams('testSize', 'string', 'all');
const testCategoryFilter   = useParams('testCategory', 'string', 'all');
const showTestsSearch      = ref(false);
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
      "title": currentTest.value ? filters.titleCase(entityType.value) + ": " + currentTest.value.display_name : "",
      "subtitle": currentTest.value ? `<span class='test-description ${testItem(currentTest.value.key)?.colorClass}'>${currentTest.value.description}</span>` : ""
    },
    "tests": {
      "title": filters.titleCase(entityType.value) + " Tests",
      "subtitle": "Total pass rates of key tests across the full sample set"
    },
    "plots": {
      "title": filters.titleCase(entityType.value) + " Plots",
      "subtitle": "Scatter plots of works_count and cited_by_count between production and Walden"
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
  } else if (mode.value === "plots") {
    items.push({ title: filters.titleCase(entityType.value), disabled: false, to: `/${entityType.value}` });
    items.push({ title: "Plots", disabled: true, to: `/${entityType.value}/plots` });
  }
  return items;
});


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
  if (testKey.value === "lost_works") {
    totalNum = Math.round(10000 * scale.prodOnlyExact);
  } else if (testKey.value === "new_works") {
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
    let rate = test.rate || matchRates[entityType.value][test.key];
    rows.push({
      ...test,
      rate: rate,
      color: rate > 5 ? (test.test_type === 'bug' ? 'red' : 'green') : "grey",
      colorClass: rate > 5 ? (test.test_type === 'bug' ? 'bug' : 'feature') : "",
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
  let items = [...testItems.value];
  
  if (testDirectionFilter.value === 'worse') {
    items = items.filter(item => item.test_type === 'bug');
  } else if (testDirectionFilter.value === 'better') {
    items =  items.filter(item => item.test_type === 'feature');
  }

  if (testSizeFilter.value === 'big') {
    items = items.filter(item => item.rate > 5);
  } else if (testSizeFilter.value === 'small') {
    items = items.filter(item => item.rate < 5);
  }

  if (testCategoryFilter.value !== 'all') {
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
      
      if (testDirectionFilter.value === 'better') {
        return b.rate - a.rate;        
      }

      // Bugs first (descending rate), then features (ascending rate)
      if (a.test_type !== b.test_type) {
        return a.test_type === 'bug' ? -1 : 1;
      }
      return a.test_type === 'bug' ? b.rate - a.rate : a.rate - b.rate;
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
  return `${sortedTestItems.value.length} tests`;
});

const coverageHeaders = computed(() => {
  return [
    { 
      title: 'Entity',
      key: 'type',
      align: 'right',
      width: '200px',
      sortable: true,
    },
    { 
      title: 'Missing %', 
      key: 'missing',
      align: 'end',
      sortable: true,
    },
    { 
      title: 'New %', 
      key: 'new',
      align: 'end',
      sortable: true,
    },
    { 
      title: 'Failing Tests', 
      key: 'failingTests',
      align: 'end',
      sortable: true,
    },
    { 
      title: 'Works %', 
      key: 'worksCountChange',
      align: 'end',
      sortable: true,
    },
    { 
      title: 'Works Correlation', 
      key: 'worksCorrelation',
      align: 'end',
      sortable: true,
    },
    { 
      title: 'Citations %', 
      key: 'citationsCountChange',
      align: 'end',
      sortable: true,
    },
    { 
      title: 'Citations Correlation', 
      key: 'citationsCorrelation',
      align: 'end',
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
    let worksCountChange = "-";
    let citationsCountChange = "-";
    if ("field_sums" in coverage[entity]["prod"]) {
      worksCountChange = calcFieldSumChange(entity, "works_count");
      citationsCountChange = calcFieldSumChange(entity, "cited_by_count");
    }
    rows.push({
      type: entity,
      missing: 100 - coverage[entity]["prod"]["coverage"],
      new: 100 - coverage[entity]["walden"]["coverage"],
      failingTests: nFailingTests(entity),
      worksCountChange: worksCountChange,
      citationsCountChange: citationsCountChange,
      worksCorrelation: coverage[entity]["correlations"]["works_count"] || "-",
      citationsCorrelation: coverage[entity]["correlations"]["cited_by_count"] || "-",
      testFailRate: entity in matchRates ? matchRates[entity]["_average_bug"] : "-",
      sampleSize: "both" in coverage[entity] ? coverage[entity]["both"]["sampleSize"] : "-",
    });
  });
  return defaultCoverageSort(rows);
});

const coverageItem = (entity) => {
  return coverageItems.value.find(item => item.type === entity);
} 

const nFailingTests = (entity) => {
  if (!matchRates[entity]) { return 0; }
  const bugKeys = schema.value[entity].filter(test => test.test_type === "bug").map(test => test.key);
  return bugKeys.filter(key => matchRates[entity][key] > 0).length;
}

const calcFieldSumChange = (entity, field) => {
  const prodValue = coverage[entity]["prod"]["field_sums"][field];
  const waldenValue = coverage[entity]["walden"]["field_sums"][field];
  
  if (prodValue === 0 && typeof waldenValue === "number" && waldenValue > 0) {
    return "∞";
  }

  if (!prodValue || !waldenValue) {
    return "-";
  }
  return Math.round(((waldenValue - prodValue) / prodValue) * 100);
}

const defaultCoverageSort = (rows) => {
  const top = ["works",  "sources", "institutions", "publishers", "topics", "keywords", "concepts", "countries", "languages", "licenses", "domains", "fields", "subfields", "sdgs", "institution-types", "source-types", "work-types", "continents", "authors", "funders",];

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

const plotData = computed(() => {
  
  const works = {
    title: "Works Count",
    field: "works_count",
  };
  
  const citations = {
    title: "Citations Count",
    field: "cited_by_count",
  };
  
  const referencedWorks = {
    title: "Referenced Works Count",
    field: "referenced_works_count",
  };

  const fwci = {
    title: "FWCI",
    field: "fwci",
  };

  const countries = {
    title: "Countries Count",
    field: "countries_distinct_count",
  };

  const institutions = {
    title: "Institutions Count",
    field: "institutions_distinct_count",
  };
  
  const locations = {
    title: "Locations Count",
    field: "locations_count",
  };
  
  const plots = entityType.value === "works" ? 
    [citations, referencedWorks, fwci, locations, countries, institutions] : 
    [works, citations];

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

const handlePlotPointClick = (point) => {
  compareId.value = point.id;
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
  const worksPseudoTests = [
    {
      "display_name": "Lost Works",
      "key": "lost_work",
      "test_type": "bug",
      "category": "other",
      "is_pseudo": true,
      "sample_source": "works-prod-only",
      "rate": 100 - coverage["works"]["prod"]["coverage"],
      "description": "Works that are in prod but not in Walden",
    },
    {
      "display_name": "New Works",
      "key": "new_works",
      "test_type": "feature",
      "category": "other",
      "is_pseudo": true,
      "sample_source": "works-walden-only",
      "rate": 100 - coverage["works"]["walden"]["coverage"],
      "description": "Works that are in Walden but not in prod",
    },
  ];
  const sourcesPseudoTests = [
    {
      "display_name": "New Sources",
      "key": "new_sources",
      "test_type": "feature",
      "category": "other",
      "is_pseudo": true,
      "sample_source": "sources-walden-only",
      "rate": 100 - coverage["sources"]["walden"]["coverage"],
      "description": "Sources that are in Walden but not in prod",
    },
  ];
  schema.value["works"].push(...worksPseudoTests);
  schema.value["sources"].push(...sourcesPseudoTests);
};

const entityIcons = {
  authors: "mdi-account-outline",
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


onMounted(async () => {
  await fetchSchema();
  fetchMatchRates();
  fetchCoverage();
  if (mode.value === "plots") {
    pageSize.value = 1000;
  }
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
    pageSize.value = 1000;
    await fetchMetricsResponses();
  } else {
    pageSize.value = 20;
  } 
  if (to === "tests" && testsSearch.value) {
    showTestsSearch.value = true;
  } else {
    showTestsSearch.value = false;
  }
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
:deep(.test-description code) {
  background-color: #f5f5f5;
  color: #555;
  font-family: monospace;
  font-size: 0.95em;
  padding: 0.2em 0.4em;
  border-radius: 5px;
}
:deep(.test-description.feature code) {
  background-color: #f5f5f5;
  color: #22863a;
}
:deep(.test-description.bug code) {
  background-color: #f5f5f5;
  color: #d73a49;
}
.plot-nav-item {
  padding-inline-start: 24px !important;
  border-top-right-radius: 9999px !important;
  border-bottom-right-radius: 9999px !important;
}
.v-card, .v-overlay {
  overflow: visible !important;
}
.v-data-table tbody tr.row-is-link {
  position: relative;
}
.v-data-table tbody tr.row-is-link > td {
  position: static !important;
}
.v-data-table tbody tr.row-is-link .row-link-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  text-decoration: none;
  color: inherit;
}
.v-data-table tbody tr.row-is-link:hover .row-link-overlay {
  cursor: pointer;
}

</style>