<template>
  <v-container class="mt-8">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <h1 class="text-h1 mb-8">Overview</h1>
        
        <v-skeleton-loader v-if="!coverageItems" type="list-item-three-line@12"></v-skeleton-loader>
        
        <v-data-table
          v-else
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

                    <template v-else-if="['worksCorrelation', 'citationsCorrelation'].includes(column.key)">
                      <div class="text-right">
                        <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                        <div v-else>
                          <code>{{ item[column.key].toFixed(2) }}</code>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="['worksCountChange', 'citationsCountChange'].includes(column.key)">
                      <div class="text-right">
                        <div v-if="item[column.key] === '-'" class="text-grey-darken-1">-</div>
                        <div v-else-if="item[column.key] === '∞'">+∞</div>
                        <div v-else>
                          <code>
                            {{ item[column.key] !== "-" && item[column.key] > 0 ? "+" : "" }}{{ item[column.key] }}%
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
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';
import axios from 'axios';
import filters from '@/filters';
import { isEntityEnabled } from '@/config/featureFlags';

defineOptions({ name: 'Overview' });

useHead({
  title: 'Overview'
});

const router = useRouter();

// Entity icons mapping
const entityIcons = {
  'authors': 'mdi-account-outline',
  'concepts': 'mdi-lightbulb-outline',
  'continents': 'mdi-earth',
  'countries': 'mdi-flag-outline',
  'domains': 'mdi-tag-outline',
  'fields': 'mdi-tag-outline',
  'funders': 'mdi-cash-multiple',
  'institution-types': 'mdi-shape-outline',
  'institutions': 'mdi-domain',
  'keywords': 'mdi-key-outline',
  'languages': 'mdi-translate',
  'licenses': 'mdi-certificate-outline',
  'publishers': 'mdi-book-open-page-variant-outline',
  'sdgs': 'mdi-earth',
  'source-types': 'mdi-shape-outline',
  'sources': 'mdi-book-open-outline',
  'subfields': 'mdi-tag-outline',
  'topics': 'mdi-tag-outline',
  'work-types': 'mdi-shape-outline',
  'works': 'mdi-file-document-outline',
};

const coverage = reactive({});
const coverageLoaded = ref(false);

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
      title: 'Works', 
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
      title: 'Citations', 
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
    // Filter out awards and disabled entities
    if (entity === 'awards' || !isEntityEnabled(entity)) return;
    
    let worksCountChange = "-";
    let citationsCountChange = "-";
    if ("field_sums" in coverage[entity]["prod"]) {
      worksCountChange = calcFieldSumChange(entity, "works_count");
      citationsCountChange = calcFieldSumChange(entity, "cited_by_count");
    }
    rows.push({
      type: entity,
      worksCountChange: worksCountChange,
      citationsCountChange: citationsCountChange,
      worksCorrelation: coverage[entity]["correlations"]["works_count"] || "-",
      citationsCorrelation: coverage[entity]["correlations"]["cited_by_count"] || "-",
      sampleSize: "both" in coverage[entity] ? coverage[entity]["both"]["sampleSize"] : "-",
    });
  });
  return defaultCoverageSort(rows);
});

const calcFieldSumChange = (entity, field) => {
  const prodValue = coverage[entity]["prod"]["field_sums"][field];
  const waldenValue = coverage[entity]["walden"]["field_sums"][field];
  
  if (prodValue === 0 && typeof waldenValue === "number" && waldenValue > 0) {
    return "∞";
  }

  if (!prodValue || !waldenValue) {
    return "-";
  }

  const change = ((waldenValue - prodValue) / prodValue) * 100;
  return Math.round(change);
}

const defaultCoverageSort = (rows) => {
  return rows.sort((a, b) => {
    const order = ['works', 'authors', 'sources', 'institutions', 'publishers', 'funders'];
    const aIndex = order.indexOf(a.type);
    const bIndex = order.indexOf(b.type);
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.type.localeCompare(b.type);
  });
}

// Fetch coverage data
onMounted(async () => {
  try {
    const response = await axios.get('https://metrics-api.openalex.org/coverage?sample=all');
    Object.assign(coverage, response.data.data);
    coverageLoaded.value = true;
  } catch (error) {
    console.error('Error loading coverage:', error);
  }
});
</script>

<style scoped>
.metrics-table {
  border: 1px solid #e8e8e8;
}
</style>
