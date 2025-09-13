<template>
  <div :class="['py-0 py-sm-12']" style="min-height: calc(100vh - 70px);">
    <v-container :fluid="smAndDown" :class="['pa-0', 'pa-sm-4']">
      <v-row>
        <v-col cols="12">
          <div v-if="breadcrumbs" class="d-flex align-start mt-n6">
            <v-breadcrumbs :items="breadcrumbs" divider="›" class="px-0 pt-0 pb-2" />
          </div>
          <div class="d-flex align-center">
            <div class="text-h3 mb-1">
              Xpac Facets
            </div>
            <v-spacer></v-spacer>
            <v-btn variant="flat" rounded="pill" class="mr-1" @click="visibleFacets = [...facets]">All</v-btn>
            <v-btn variant="flat" rounded="pill" class="mr-2" @click="resetToDefaults">Defaults</v-btn>
            <v-btn icon="mdi-plus" variant="flat" size="default" color="primary" @click="showFacetsDialog = true"></v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="facet in visibleFacets" :key="facet" cols="2" lg="4" sm="6" xs="12">
          <xpac-facet 
            :facet="facet"
            @removeFacet="visibleFacets = visibleFacets.filter(f => f !== facet)"
          ></xpac-facet>
        </v-col>  
      </v-row>
    </v-container>

    <!-- Facet Management Dialog -->
    <v-dialog v-model="showFacetsDialog" max-width="600px" min-height="500px" scrollable>
      <v-card v-if="showFacetsDialog" class="pa-0" rounded="lg">
        <v-card-text class="pa-0">
          <!-- Search Input -->
          <div>
            <v-text-field
              v-model="searchQuery"
              label="Search facets"
              prepend-inner-icon="mdi-magnify"
              density="default"
              clearable
              hide-details
            ></v-text-field>
          </div>
          
          <!-- Facet List -->
          <div class="pa-4 pt-2" style="max-height: 400px; overflow-y: auto;">
            <div v-for="facet in filteredFacets" :key="facet" class="mb-2">
              <v-chip
                v-if="isFacetVisible(facet)"
                :text="facet"
                color="primary"
                variant="tonal"
                closable
                @click:close="toggleFacet(facet)"
              ></v-chip>
              <div
                v-else
                class="facet-option py-1 px-2 rounded cursor-pointer"
                @click="toggleFacet(facet)"
              >
                {{ facet }}
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="primary" rounded="pill" @click="showFacetsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useParams } from '@/composables/useStorage';
import XpacFacet from '@/components/XpacFacet.vue';

const defaultFacets = [
    "type",
    "language",
    "oa_status",
    "is_oa",
    "institution.id",
    "topics.id",
    "locations.license",
    "institutions.type",
    "institutions.country_code",
    "institutions.is_global_south",
    "best_oa_location.source.id",
    "concepts.id",
];

const visibleFacets = useParams('facets', 'array', defaultFacets);

const showFacetsDialog = ref(false);
const { smAndDown } = useDisplay();

const breadcrumbs = [
    { title: "Home", disabled: false, to: "/" },
    { title: "Works", disabled: false, to: `/works` },
    { title: "Xpac Facets", disabled: true, to: `/works/xpac-facets` },
];

const facets = [
  "apc_list.currency",
  "apc_list.provenance",
  "apc_list.value_usd",
  "apc_paid.provenance",
  "apc_paid.value_usd",
  "authorships.is_corresponding",
  "best_oa_location.is_accepted",
  "best_oa_location.is_oa",
  "best_oa_location.is_published",
  "best_oa_location.license",
  "best_oa_location.license_id",
  "best_oa_location.source.host_organization",
  "best_oa_location.source.id",
  "best_oa_location.source.is_in_doaj",
  "best_oa_location.source.is_oa",
  "best_oa_location.source.type",
  "best_oa_location.version",
  "concept.id",
  "concepts.id",
  "has_abstract",
  "has_doi",
  "has_fulltext",
  "has_orcid",
  "has_pdf_url",
  "has_pmcid",
  "has_pmid",
  "has_raw_affiliation_strings",
  "has_references",
  "institution.id",
  "institutions.country_code",
  "institutions.id",
  "institutions.is_global_south",
  "institutions.type",
  "is_corresponding",
  "is_oa",
  "is_paratext",
  "is_retracted",
  "journal",
  "keywords.id",
  "language",
  "locations.is_accepted",
  "locations.is_oa",
  "locations.is_published",
  "locations.license",
  "locations.license_id",
  "locations.source.host_organization",
  "locations.source.id",
  "locations.source.is_core",
  "locations.source.is_in_doaj",
  "locations.source.is_oa",
  "locations.source.type",
  "locations.version",
  "oa_status",
  "open_access.any_repository_has_fulltext",
  "open_access.is_oa",
  "primary_location.is_accepted",
  "primary_location.is_oa",
  "primary_location.is_published",
  "primary_location.license",
  "primary_location.license_id",
  "primary_location.source.has_issn",
  "primary_location.source.host_organization",
  "primary_location.source.id",
  "primary_location.source.is_core",
  "primary_location.source.is_in_doaj",
  "primary_location.source.is_oa",
  "primary_location.source.type",
  "primary_location.version",
  "primary_topic.domain.id",
  "primary_topic.field.id",
  "primary_topic.id",
  "primary_topic.subfield.id",
  "publication_year",
  "repository",
  "topics.domain.id",
  "topics.field.id",
  "topics.id",
  "topics.subfield.id",
  "type",
  "type_crossref",
];

const showDialog = ref(false);
const searchQuery = ref('');

const filteredFacets = computed(() => {
  return facets.filter(facet => facet.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const isFacetVisible = (facet) => {
  return visibleFacets.value.includes(facet);
};

const toggleFacet = (facet) => {
  if (isFacetVisible(facet)) {
    visibleFacets.value = visibleFacets.value.filter(f => f !== facet);
  } else {
    visibleFacets.value.unshift(facet);
  }
};

const resetToDefaults = () => {
  visibleFacets.value = defaultFacets;
  showDialog.value = false;
};
</script>

<style scoped>
.facet-option {
  border: 1px solid transparent;
}
.facet-option:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}
</style>
