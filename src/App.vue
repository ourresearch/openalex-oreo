<template>
  <v-app>
    <v-app-bar
      flat
      :height="smAndDown ? undefined : 70"
      color="white"
      class="app-bar-border"
      absolute
      extension-height="70"
    >
      <router-link to="/" class="logo-link ml-2 mr-2">
        <img
          src="@/assets/tricon.png"
          class="logo-icon mr-0 colorizable"
        />
        <span class="logo-text font-weight-bold">OREO:</span>
      </router-link>
      <span class="logo-subtext">
         OpenAlex rewrite evaluation overview
      </span>

      <v-spacer></v-spacer>

      <v-btn
        to="/changelog"
        variant="text"
        class="text-none"
      >
        Changelog
      </v-btn>

    </v-app-bar>

    <v-navigation-drawer
      permanent
      width="240"
    >
      <v-list nav>
        <!-- Core category -->
        <v-list-group value="core">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Core" prepend-icon="mdi-bullseye" />
          </template>
          <v-list-item
            v-for="entity in coreEntities"
            :key="entity.id"
            :to="`/${entity.id}`"
            :title="entity.title"
          />
        </v-list-group>

        <!-- Aboutness category -->
        <v-list-group value="aboutness">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Aboutness" prepend-icon="mdi-tag-multiple-outline" />
          </template>
          <v-list-item
            v-for="entity in aboutnessEntities"
            :key="entity.id"
            :to="`/${entity.id}`"
            :title="entity.title"
          />
        </v-list-group>

        <!-- Geo category -->
        <v-list-group value="geo">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Geo" prepend-icon="mdi-earth" />
          </template>
          <v-list-item
            v-for="entity in geoEntities"
            :key="entity.id"
            :to="`/${entity.id}`"
            :title="entity.title"
          />
        </v-list-group>

        <!-- Types category -->
        <v-list-group value="types">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Types" prepend-icon="mdi-shape-outline" />
          </template>
          <v-list-item
            v-for="entity in typesEntities"
            :key="entity.id"
            :to="`/${entity.id}`"
            :title="entity.title"
          />
        </v-list-group>

        <!-- Funding category -->
        <v-list-group value="funding">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Funding" prepend-icon="mdi-cash-multiple" />
          </template>
          <v-list-item
            v-for="entity in fundingEntities"
            :key="entity.id"
            :to="`/${entity.id}`"
            :title="entity.title"
          />
        </v-list-group>

        <!-- Content category -->
        <v-list-group value="content">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Content" prepend-icon="mdi-text" />
          </template>
          <v-list-item
            v-for="entity in contentEntities"
            :key="entity.id"
            :to="`/${entity.id}`"
            :title="entity.title"
          />
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main class="ma-0 pb-0 bg-color">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>


<script setup>
defineOptions({ name: 'App' });

import { ref, onMounted, computed } from 'vue';
import { smAndDown } from 'vuetify';
import { useHead } from '@unhead/vue';

// Head
useHead({
  titleTemplate: (title) => (title ? `${title} | OREO` : 'OpenAlex Rewrite Evaluation Overview'),
  link: [],
  meta: []
});

// Entity icons mapping (matching the home page table)
const entityIcons = {
  'authors': 'mdi-account-outline',
  'awards': 'mdi-trophy-outline',
  'continents': 'mdi-earth',
  'countries': 'mdi-earth',
  'concepts': 'mdi-lightbulb-outline',
  'domains': 'mdi-tag-outline',
  'fields': 'mdi-tag-outline',
  'funders': 'mdi-cash-multiple',
  'institution-types': 'mdi-shape-outline',
  'institutions': 'mdi-town-hall',
  'keywords': 'mdi-tag-outline',
  'languages': 'mdi-translate',
  'licenses': 'mdi-lock-open-outline',
  'publishers': 'mdi-domain',
  'sdgs': 'mdi-sprout-outline',
  'source-types': 'mdi-shape-outline',
  'sources': 'mdi-book-open-outline',
  'subfields': 'mdi-tag-outline',
  'topics': 'mdi-tag-outline',
  'work-types': 'mdi-shape-outline',
  'works': 'mdi-file-document-outline',
};

// Fetch entities from API
const coverage = ref({});

// Define category groupings
const aboutnessGroup = ['concepts', 'domains', 'fields', 'keywords', 'sdgs', 'subfields', 'topics'];
const geoGroup = ['continents', 'countries'];
const typesGroup = ['work-types', 'source-types', 'institution-types'];
const fundingGroup = ['funders', 'awards'];
const contentGroup = ['licenses', 'languages'];

const allEntities = computed(() => {
  if (!coverage.value || !coverage.value.data) return [];
  
  const entityKeys = Object.keys(coverage.value.data);
  
  return entityKeys.map(entityId => ({
    id: entityId,
    title: entityId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    icon: entityIcons[entityId] || 'mdi-circle',
  }));
});

const coreEntities = computed(() => {
  return allEntities.value.filter(entity => 
    !aboutnessGroup.includes(entity.id) &&
    !geoGroup.includes(entity.id) &&
    !typesGroup.includes(entity.id) &&
    !fundingGroup.includes(entity.id) &&
    !contentGroup.includes(entity.id)
  );
});

const aboutnessEntities = computed(() => {
  return allEntities.value.filter(entity => aboutnessGroup.includes(entity.id));
});

const geoEntities = computed(() => {
  return allEntities.value.filter(entity => geoGroup.includes(entity.id));
});

const typesEntities = computed(() => {
  return allEntities.value.filter(entity => typesGroup.includes(entity.id));
});

const fundingEntities = computed(() => {
  return allEntities.value.filter(entity => fundingGroup.includes(entity.id));
});

const contentEntities = computed(() => {
  return allEntities.value.filter(entity => contentGroup.includes(entity.id));
});

async function fetchCoverage() {
  try {
    const metricsUrl = 'https://metrics-api.openalex.org';
    const response = await fetch(`${metricsUrl}/coverage?sample=all`);
    const data = await response.json();
    coverage.value = data;
  } catch (error) {
    console.error('Error fetching coverage:', error);
  }
}

onMounted(() => {
  fetchCoverage();
});
</script>


<style lang="scss">

$color-3: hsl(210, 60%, 98%);
$color-2: hsl(213, 69%, 95%);
$color-1: hsl(213, 72%, 88%);
$color-0: hsl(212, 77%, 82%);

$bg-color: #ffffff;

.v-main {
  background-color: #fff
}
.bg-color {
  background-color: $bg-color !important;
}
.color-3 {
  background-color: $color-3 !important;
}
.color-2 {
  background-color: $color-2 !important;
}
.color-1 {
  background-color: $color-1 !important;
}
.color-0 {
  background-color: $color-0 !important;
}
.hover-color-3:hover {
  background-color: $color-3 !important;
  transition: background-color 500ms;
}
.hover-color-white:hover {
  background-color: white !important;
  transition: background-color 500ms;
}
.hover-color-2:hover {
  background-color: $color-2 !important;
  transition: background-color 500ms;
}
.hover-color-1:hover {
  background-color: $color-1 !important;
  transition: background-color 500ms;
}
.hover-color-0:hover {
  background-color: $color-0 !important;
  transition: background-color 500ms;
}
.v-card.factoid-card {
  //background-color: #EEF5FC;
  background-color: $color-3;
  border: none;
  box-shadow: none;
  .v-card__title {
    background-color: $color-1;
  }
  .v-card__text {
    padding-top: 12px;
    background-color: white;
  }
}
.v-card.button-card {
  transition: background-color 300ms;
  background-color: $color-3;
  border: none;
  &:hover {
    background-color: $color-2;
    &.no-hover {
      background-color: $color-1;
    }

  }
}
.v-toolbar__content,
.v-toolbar__extension {
    padding: 4px 16px;
}
.keyboard-shortcut {
  color: #9e9e9e; // vuetify grey--text
  border: 1px solid #ccc;
  padding: 0 5px;
  border-radius: 5px;
}
// don't show when a card has focus because we don't care.
.v-card--link:focus:before {
  opacity: 0;
}
.theme--dark.v-card {
  background-color: #444;
}
.theme--dark.v-sheet {
  background-color: #444;
}
.v-btn--active.no-active::before {
  opacity: 0.00005 !important;
}
.v-btn.v-size--default {
  //opacity: 0.00005 !important;
  font-size: 1rem;
}
.monospace,
.monospace * {
  font-family: monospace !important;
  &.body-1 {
    font-family: monospace !important;
  }
  &.body-2 {
    font-family: monospace !important;
  }
}
.v-btn {
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
}
.v-btn--is-elevated {
  box-shadow: none;
}
.white-space-normal {
  white-space: normal !important;
}
$logo-link-height: 30px;
.logo-link {
  font-weight: bold;
  text-decoration: none;
  letter-spacing: -.05em;
  display: flex;
  align-items: center;
  //padding-left: 30px;
  .logo-icon {
    height: $logo-link-height;
    //margin-top: -5px;
  }
  .logo-text {
    padding-left: .3em;
    line-height: 1.2;
    color: #000;
    font-family: Inter, sans-serif;
    font-size: $logo-link-height * 0.9;
    font-weight: 500;
  }
}
.logo-subtext {
    font-family: Inter, sans-serif;
    font-size: $logo-link-height * 0.9;
    font-weight: 300;
  }
body {
  font-family: Inter, sans-serif;
  line-height: 1.5;
}

.v-application,
.v-application * {
  font-family: Inter, sans-serif !important;
}

.v-card--variant-outlined {
  border-color: #e8e8e8 !important;
}

.app-bar-border {
  border-bottom: 1px solid #e8e8e8 !important;
}

.v-list-group__items {
  --indent-padding: 25px !important;
}

.v-application {
  //background: #F7F9FC !important;
  //background: #fff !important;
  //background: pink !important;
  .body-1, .body-2 {
    letter-spacing: normal !important;
  }
  .body-1 {
    font-size: 16px !important;
  }
  .body-2 {
    font-size: 14px !important;
  }
  .subtitle-1 {
    font-size: 17px !important;
  }
  .text-h6 {
    line-height: 1.3;
  }
  .text-initial {
    text-transform: initial !important;
  }
}
.low-key-button {
  text-transform: none !important;
  font-weight: normal !important;
  letter-spacing: 0 !important;
}
.v-list-item__prepend {
  display: inline !important;
}

.v-list-item__action {
  align-self: flex-start;
  margin-top: 8px;
}
.v-list--two-line.v-list--dense .v-list-item {
  min-height: unset;
}
.v-list-item {
  min-height: unset !important;
  .v-list-item__content {
    padding: 10px 0 !important;
  }
}
.v-application--is-ltr .v-list-item__action:first-child, .v-application--is-ltr .v-list-item__icon:first-child {
  margin-right: 8px;
}
.capitalize-first-letter::first-letter {
  text-transform: uppercase !important;
}
img.site-footer-logo {
  width: 60px;
}
.page {
  margin-top: 50px;
}
.v-tabs--icons-and-text .v-tab {
  font-size: 12px !important;
  text-transform: capitalize;
}
.v-menu {
  overflow: hidden;
}

</style>