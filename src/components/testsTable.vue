<template>
  <v-data-table
    :headers="testHeaders"
    :items="items"
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
</template>

<script setup>
import { useRouter } from "vue-router";

defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const router = useRouter();

const testHeaders =  [
  { title: '', key: 'donut', width: "35px", tight: false },
  { title: '', key: 'rate', width: "35px", tight: true },
  { title: '', key: 'type', width: "35px", tight: true },
  { title: '', key: 'display_name' },
  { title: '', key: 'category' },
  { title: '', key: 'description' },
];

</script>

<style scoped>
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
</style>
