<template>
  <div class="">
    <v-skeleton-loader v-if="isLoading" type="list-item-three-line@12"></v-skeleton-loader>

    <template v-if="!isLoading">
      <v-data-table
        :headers="headers"
        :items="idsWithData"
        :items-per-page="-1"
        class="fixed-table"
        flat
        hide-default-footer
        density="compact"
        item-value="name"
      >
        <template v-slot:headers="{ columns }">
          <tr>
            <th v-for="column in columns" :key="column.key" :style="column.key !== 'spacer' ? {width: column.width} : {}">
              <span>{{ column.title }}</span>
            </th>
          </tr>
        </template>
        <template v-slot:item="{ item, columns }">
          <tr>
            <td v-for="column in columns" :key="column.key" :style="column.key === 'matches' ? {'vertical-align': 'top'} : {}">
              
              <div v-if="column.key === 'prod'" class="py-7 pr-4">
                <div v-if="source === 'walden-only'" class="text-grey">-</div>
                <google-scholar-view v-else :id="item" :data="apiData[item]" @title-click="zoomId = $event"/>
              </div>

              <div v-else-if="column.key === 'walden'" class="py-7 w-100">
                <div v-if="source === 'prod-only'" class="text-grey">-</div>
                <google-scholar-view v-else :id="item" :data="apiData[item]" @title-click="zoomId = $event"/>
              </div>

              <div v-else-if="column.key === 'matches' && source === 'walden-only'" class="pt-7 text-caption">
                <v-chip
                  v-if="!(item in titleMatches) && apiData[item].title"
                  color="grey"
                  size="x-small"
                  class="display-inline-block mb-1"
                  :href="`https://openalex.org/works?filter=display_name.search:${encodeTitle(apiData[item].title)}`" 
                  target="_blank"
                >
                  Checking...
                </v-chip>

                <v-chip
                  v-if="titleMatches[item]"
                  :href="`https://openalex.org/works?filter=display_name.search:${encodeTitle(apiData[item].title)}`" 
                  target="_blank"
                  color="blue"
                  size="x-small"
                  class="display-inline-block flex-grow-0 mb-1"
                  style="text-decoration: none;"
                >
                  {{ titleMatches[item].toLocaleString() }} {{ titleMatches[item] === 1 ? 'match' : 'matches' }}
                  <v-icon class="ml-0" icon="mdi-chevron-right"></v-icon>
                </v-chip>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>

      <v-pagination
        v-if="!isLoading"
        v-model="page"
        :length="100"
        :total-visible="10"
        rounded
        class="mt-8"
      ></v-pagination>

    </template>

  </div>

  <!-- Work Details Drawer -->  
  <work-drawer 
    v-model:isDrawerOpen="isDrawerOpen" 
    :workId="zoomId" 
    :workData="zoomId && apiData[zoomId] ? apiData[zoomId] : null"
    :isV2="source === 'walden-only'"
    @close="onDrawerClose"
  />

</template>


<script setup>
import { ref, computed, watch, toRefs } from 'vue';
import { useDisplay } from 'vuetify';
import axios from 'axios';

import { samples } from '@/qa/samples';
import { useParams } from '@/composables/useStorage';
import WorkDrawer from '@/components/QA/WorkDrawer.vue';
import GoogleScholarView from '@/components/QA/googleScholarView.vue';


const props = defineProps({
  source: {
    type: String,
    default: 'walden-only'
  },
  fractionToShow: {
    type: Number,
    default: 1
  }
});

const axiosConfig = {headers: {Authorization: "Bearer YWMKSvdNwfrknsOPtdqCPz"}};
const entityType = 'works';

const apiData       = ref({});
const titleMatches  = ref({});
const isLoading     = ref(true);
const pageSize      = ref(20);
const page          = useParams('page', 'number', 1);
const zoomId        = useParams('zoomId', 'string', null);

const { source } = toRefs(props);

const { mdAndDown } = useDisplay();

const sample    = computed(() => source.value === 'walden-only' ? samples.xpac4 : samples.prodOnly2);
const sampleIds = computed(() => sample.value.ids.slice(0, Math.floor(sample.value.ids.length * props.fractionToShow)));

const idsToShow = computed(() => {
  return sampleIds.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value);
});

const idsWithData = computed(() => {
  return idsToShow.value.filter(id => id in apiData.value);
});

const headers = computed(() => {
  const columns = [
    {title: "Prod", key: "prod", width: mdAndDown.value ? "300px" : "450px"},
    {title: "Walden", key: "walden", width: mdAndDown.value ? "300px" : "450px"},
    {title: "", key: "matches"},
  ];
  return columns;
});

const isDrawerOpen = computed(() => zoomId.value !== null);

async function fetchResponses() {
  isLoading.value = true;

  let newIds = [];
  idsToShow.value.forEach(id => {
    if (!(id in apiData.value)) {
      newIds.push(id);
    }
  });
  if (newIds.length > 0) {
    const versionStr = source.value === 'walden-only' ? '&data-version=2' : '';
    const url = `https://api.openalex.org/${entityType}?filter=ids.openalex:${newIds.join('|')}&per_page=100${versionStr}`;
    const response = await axios.get(url, axiosConfig);
    response.data.results.forEach(result => {
      apiData.value[extractID(result.id)] = result;
    });
  }
  isLoading.value = false;
}

const extractID = (input) => {
  return input.split("/").slice(-1)[0];
}

async function checkTitleMatch(id) {
  if (!apiData.value[id]?.title) { return; }
  const title = apiData.value[id].title;
  const url = `https://api.openalex.org/works?filter=display_name.search:${encodeTitle(title)}`;
  try {
    const response = await axios.get(url, axiosConfig);
    titleMatches.value[id] = response.data.meta.count;
  } catch (error) {
    console.error("Error checking title match:", error);
  }
}

function encodeTitle(title) {
  title = title.replace(/[^\w\s]/gi, ' ');
  title = title.replace(/\s+/g, '+');
  return encodeURIComponent(title);
}

watch(idsToShow, async () => {
  await fetchResponses();
  if (source.value === 'walden-only') {
    idsToShow.value.forEach(id => {
      if (!(id in titleMatches.value)) {
        checkTitleMatch(id);
      }
    });
  }
}, { immediate: true });

function onDrawerClose() {
  zoomId.value = null;
}
</script>


<style scoped>
.square-btn {
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
}
.fixed-table >>> table {
  table-layout: fixed;
}
.option-card {
  border-color: #BDBDBD;
  background-color: #FAFAFA;
}
.option-card.selected {
  border-color: #64B5F6;
  background-color: #E1F5FE;
}
.option-card .v-icon {
  margin-top: -2px;
}
:deep(.option-card.selected input) {
  background-color: white !important;
}
</style>