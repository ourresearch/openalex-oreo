<template>
  <v-card class="compare-card rounded-o" transition="none">
    <v-card-title :class="['px-6 pt-2 pb-0 d-flex', match ? 'bg-green-lighten-4' : 'bg-red-lighten-4']" style="font-size: 18px; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      {{ test.display_name }}

      <v-spacer></v-spacer>
      <v-btn @click="emit('close')" size="default" icon variant="text" class="mt-n2 mr-n6">
        <v-icon size="default" variant="plain" icon="mdi-close"></v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pb-2 pt-6">
      <div class="d-flex align-center justify-center">
        <div class="compare-value-block">
          <div class="compare-value">{{ displayValue(prodValue) }}</div>
          <div class="compare-value-label">
            <v-icon size="small" color="grey" class="count-icon" icon="mdi-factory"></v-icon> Prod
          </div>
        </div>

        <span class="mx-6"></span>

        <div class="compare-value-block">
          <div class="compare-value">{{ displayValue(waldenValue) }}</div>
          <div class="compare-value-label">
            <v-icon size="small" color="grey" class="count-icon" icon="mdi-pine-tree-variant-outline"></v-icon> Walden
          </div>
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn @click="onShowComparison" size="small" variant="tonal">
        Compare
        <v-icon size="small" end variant="plain" icon="mdi-chevron-right"></v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>


<script setup>
import { computed } from 'vue';

const {id, test, match, prodValue, waldenValue} = defineProps({
 id: String,
 test: Object,
 match: Boolean,
 prodValue: null,
 waldenValue: null,
});

const emit = defineEmits(['show-comparison', 'close']);

const displayValue = (value) => {
  if (value === undefined) {
    return "missing";
  }
  if (value === null) {
    return "null";
  }

  return getShortValue(value);
}

const prodDisplayValue = computed(() => {
  return displayValue(prodValue);
});

const waldenDisplayValue = computed(() => {
  return displayValue(waldenValue);
});


const onShowComparison = () => {
  emit('show-comparison', id);
};

const getShortValue = (value) => {
  if (Array.isArray(value)) {
    return `${value.length}`;
  } else if (typeof value === 'object' && value !== null) {
    return `${Object.keys(value).length} keys`;
  } else {
    return value;
  }
}
</script>

<style scoped>
.compare-card {
  background-color: white;
}
.compare-card .count-icon {
  margin-left: 2px;
  margin-top: -4px
}
.compare-card a {
  color: inherit;
  text-decoration: none;
}
.compare-card-title {
  font-weight: bold;
  font-size: 12px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  background-color: #f5f5f5;
}
.compare-card-value {
  max-height: 60vh;
  max-width: 30vw;
  overflow: auto;
}
.compare-value-block {
  text-align: center;
}
.compare-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  font-size: 28px;
}
.compare-value-label {
  text-transform: uppercase;
  color: #757575;
  font-size: 12px;
}
.array-value {
  white-space: pre;
  font-size: 12px;
  line-height: 1;
}
</style>
