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
            :class="[
              item.test_type === 'bug' 
                ? (isHovering ? 'row-red-hover' : 'row-red') 
                : (isHovering ? 'row-green-hover' : 'row-green'),
              'cursor-pointer', 
              'row-is-link'
            ]" 
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
                  <code :class="`text-${item.color} font-weight-bold`">{{ item.rate }}%</code>
                </div>
              </template>

              <template v-if="column.key === 'type'">
                <v-icon :icon="item.test_type === 'bug' ? 'mdi-emoticon-sad-outline' : 'mdi-emoticon-happy-outline'" :color="item.color" />
              </template>

              <template v-else-if="column.key === 'display_name'">
                <span class="font-weight-medium mr-2">{{ item.display_name }}</span>
                <v-chip label color="grey" variant="outlined" size="x-small" style="margin-left: 0;" class="mr-2" @click.stop="testCategoryFilter = item.category">{{ item.category }}</v-chip>
              </template>

              <template v-else-if="column.key === 'category'">
              </template>

              <template v-else-if="column.key === 'description'">
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
.v-data-table {
  border: 1px solid #e0e0e0;
}
.row-green {
  background-color: rgba(76, 175, 80, 0.12) !important;
}
.row-green-hover {
  background-color: rgba(76, 175, 80, 0.20) !important;
}
.row-red {
  background-color: rgba(244, 67, 54, 0.12) !important;
}
.row-red-hover {
  background-color: rgba(244, 67, 54, 0.20) !important;
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
code {
  font-family: monospace !important;
}
:deep(.test-description code) {
  background-color: rgba(128, 128, 128, 0.15);
  color: #333;
  font-family: monospace !important;
  font-size: 0.95em;
  padding: 0.2em 0.4em;
  border-radius: 5px;
}
</style>
