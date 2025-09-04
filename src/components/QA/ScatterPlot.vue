<template>
  <div class="d-flex flex-column align-center">
    <v-chart 
      :option="chartOption" 
      :style="{ width: '1000px', height: '700px' }"
      autoresize 
      @click="handleChartClick"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
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
  title: {
    text: props.title,
    left: 'center',
    top: 50,
    textStyle: {
      fontSize: 20,
      fontWeight: 'normal',
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: (params) => {
      const data = params.data;
      return `
        <div style="max-width: 300px; text-align: left; text-wrap: wrap;">
          <strong>${data.display_name}</strong><br/>
          <div style="font-size: 12px; color: #666;">${data.id}</div>
          <strong>Prod:</strong> ${data.prod.toLocaleString()}<br/>
          <strong>Walden:</strong> ${data.walden.toLocaleString()}
        </div>
      `;
    },
    enterable: true,
    hideDelay: 500,
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'log',
    name: 'Production',
    nameLocation: 'middle',
    nameGap: 30,
    min: 1,
    axisLabel: {
      formatter: (value) => value.toLocaleString(),
    },
  },
  yAxis: {
    type: 'log',
    name: 'Walden',
    nameLocation: 'middle',
    nameGap: 50,
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
  dataZoom: [
    {
      type: 'inside',
      xAxisIndex: 0,
    },
    {
      type: 'inside',
      yAxisIndex: 0,
    },
  ],
}));
</script>

<style scoped>
</style>

