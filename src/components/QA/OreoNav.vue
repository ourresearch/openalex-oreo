<template>
  <v-navigation-drawer permanent floating width="90">
    <v-list class="mt-0 pa-0">
      <v-list-item 
        v-for="section in sections" 
        :key="section.title" 
        exact
        :class="['nav-item', 'text-center', 'px-0', 'py-0', {'active': isActive(section)}]"
      >
        <RouterLink :to="section.to" class="d-flex flex-column align-center text-decoration-none w-100 h-100 py-0">
          <div :class="['icon-box', 'rounded-pill', 'py-1', 'px-4', 'mb-1', {'bg-blue-lighten-4': isActive(section)}]">
            <v-icon size="small" class="mb-0" :color="isActive(section) ? 'grey-darken-5' : 'grey-darken-3'" :icon="section.icon" />
          </div>
          <div class="nav-item-label text-grey-darken-3 font-weight-medium" style="font-size: 12px !important;">{{ section.title }}</div>
        </RouterLink>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineOptions({
  name: 'OreoNav'
});

const route = useRoute();

const sections = [
  { title: 'Works', to: '/works', icon: "mdi-file-document-multiple-outline"},
  { title: 'Summary', to: '/summary', icon: "mdi-chart-donut" },
  { title: 'Coverage', to: '/coverage', icon: "mdi-poll" },
];

function isActive(section) {
  if (route.path === section.to) {
    return true;
  }
  return false
}
</script>

<style scoped>
.nav-item:hover .icon-box {
  background-color: #eee;
}
.nav-item:hover .v-icon {
}
.nav-item.active .nav-item-label {
  font-weight: bold !important;
}
</style>
