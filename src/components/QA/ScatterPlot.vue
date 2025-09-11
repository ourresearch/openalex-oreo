<template>
  <div>
    <v-chart 
      :option="chartOption" 
      :style="{ width: '100%', height: '700px', maxWidth: '1200px' }"
      autoresize 
      @click="handleChartClick"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ScatterChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

const { smAndDown, mdAndDown, lgAndDown, xlAndDown } = useDisplay();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['click-point']);


// Register ECharts components
use([
  CanvasRenderer,
  ScatterChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
]);

const handleChartClick = (params) => {
  if (params.componentType === 'series' && params.seriesType === 'scatter') {
    emit('click-point', {
      id: params.data.id,
      display_name: params.data.display_name,
      prod: params.data.prod,
      walden: params.data.walden,
      coordinates: params.value,
    });
  }
};

const chartData = computed(() => {
  return props.data.map(item => ({
    value: [Math.max(1, item.prod || 1), Math.max(1, item.walden || 1)],
    id: item.id,
    display_name: item.display_name,
    prod: item.prod || 0,
    walden: item.walden || 0,
  }));
});

const maxAxisValue = computed(() => {
  if (!props.data.length) return 100;
  const values = props.data.flatMap(d => [d.prod || 0, d.walden || 0]);
  return Math.max(...values);
});

const diagonalLineData = computed(() => {
  const max = maxAxisValue.value;
  return [
    { value: [1, 1] },
    { value: [max, max] }
  ];
});

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params) => {
      const data = params.data;
      return `
        <div style="max-width: 300px; text-align: left; text-wrap: wrap;">
          <div style="margin-bottom: 8px;"><b>${data.display_name}</b></div>
          <div><b>Prod:</b> ${data.prod.toLocaleString()}</div>
          <div><b>Walden:</b> ${data.walden.toLocaleString()}</div>
        </div>
      `;
    },
    enterable: true,
    hideDelay: 500,
  },
  grid: {
    left: '50px',
    right: '50px',
    bottom: '60px',
    top: '30px',
    containLabel: true,
  },
  xAxis: {
    type: 'log',
    name: 'Production',
    nameLocation: 'middle',
    nameGap: 50,
    nameTextStyle: {
      fontWeight: 'bold',
      fontSize: 14,
    },
    min: 1,
    axisLabel: {
      formatter: (value) => value.toLocaleString(),
    },
  },
  yAxis: {
    type: 'log',
    name: 'Walden',
    nameLocation: 'middle',
    nameGap: 40,
    nameTextStyle: {
      fontWeight: 'bold',
      fontSize: 14,
    },
    min: 1,
    axisLabel: {
      formatter: (value) => value.toLocaleString(),
    },
  },
  series: [
    {
      type: 'line',
      name: '1:1 Reference Line',
      data: diagonalLineData.value,
      lineStyle: {
        color: '#666',
        type: 'dashed',
        width: 1,
      },
      symbol: 'none',
      tooltip: {
        show: false,
      },
      silent: true,
    },
    {
      type: 'scatter',
      data: chartData.value,
      symbolSize: 6,
      itemStyle: {
        color: '#1976d2',
        opacity: 0.7,
      },
      emphasis: {
        itemStyle: {
          color: '#1565c0',
          opacity: 1,
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    },
  ],

}));

</script>

<style scoped>
</style>

