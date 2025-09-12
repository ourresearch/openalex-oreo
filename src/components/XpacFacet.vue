<template>
  <v-card rounded="lg" flat class="facet fill-height">
    <v-card-title class="d-flex">
      {{ facet }}
      <v-spacer></v-spacer>
      <v-btn icon="mdi-api" size="small" density="comfortable" variant="flat" :href="apiUrl" target="_blank"></v-btn>
      <v-btn icon="mdi-close" size="small" density="comfortable" variant="flat" @click="emit(fullList ? 'close' : 'removeFacet', facet)"></v-btn>
    </v-card-title>
    <v-card-text>
      <v-skeleton-loader v-if="!data && !apiError" type="list-item"></v-skeleton-loader>
      <v-alert rounded="lg" v-else-if="apiError" type="error">API Error</v-alert>
      <div v-else>
        <table>
          <tbody>
            <tr v-for="item in dataToShow" :key="item.key">
              <td>
                <a :href="item.key" target="_blank">
                  <span v-if="item.key_display_name">{{ item.key_display_name }}</span>
                  <span v-else class="text-grey">No Display Name</span>
                </a>
              </td>
              <td class="text-right"><code>{{ filters.millify(item.count) }}</code></td>
            </tr>
            <div v-if="dataToShow.length === 0">
              <td colspan="2" class="text-center text-grey">No results</td>
            </div>
          </tbody>
        </table>
        <div class="text-center pt-2">
          <v-btn 
            v-if="!fullList && data.group_by.length > 5"
            variant="flat"
            rounded="pill"
            class="text-grey-darken-2"
            @click="showDialog = true"
          >
            More
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>

<v-dialog v-if="!fullList" v-model="showDialog" max-width="600px" scrollable>
  <xpac-facet 
    :facet="facet"
    :fullList="true"
    :data="data"
    @close="showDialog = false"
  >
  </xpac-facet>
</v-dialog>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

import XpacFacet from '@/components/XpacFacet.vue';
import filters from '@/filters';

const props = defineProps({
  facet: String,
  fullList: Boolean,
  data: Object,
});

const emit = defineEmits(['removeFacet']);

const axiosConfig = {headers: {Authorization: "Bearer YWMKSvdNwfrknsOPtdqCPz"}};

const data = ref(props.data);
const apiError = ref(false);
const showDialog = ref(false);

const dataToShow = computed(() => {
  if (!data.value) {
    return [];
  }
  if (props.fullList) {
    return data.value.group_by;
  }
  return data.value.group_by.slice(0, 5);
});

const apiUrl = computed(() => {
  return `https://api.openalex.org/works?filter=is_xpac:true&group_by=${props.facet}&data-version=2`;
});

onMounted(async () => {
  if (!data.value) {
    try {
      const response = await axios.get(apiUrl.value, axiosConfig);
      data.value = response.data;
    } catch (error) {
      console.error(error);
      apiError.value = true;
    }
  }
});

</script>
<style scoped>
.facet table {
  width: 100%;
  font-size: 16px;
  border-collapse: collapse;
}
.facet table tr {
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E0E0E0;

}
.facet table td {
  padding: 10px;
}
.facet a {
  color: inherit;
  text-decoration: none;
}
.facet a:hover {
  text-decoration: underline;
}
</style>