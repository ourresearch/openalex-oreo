<template>
  <div class="d-flex align-top justify-center">
    <v-chart 
      :option="chartOption" 
      :style="{ width: '900px', height: '700px' }"
      autoresize 
      @click="handleChartClick"
    />
    <div class="metrics" style="margin-top: 50px;">
      <div class="metric">
        <code class="metric-value">{{ spearmanRho.toFixed(2) }}</code>
        <span class="metric-label">Spearman Rho</span>
      </div>
      <div class="metric">
        <code class="metric-value">{{ identityLineR2.toFixed(2) }}</code>
        <span class="metric-label">Identity Line R²</span>
      </div>
      <div class="metric">
        <code class="metric-value">{{ r2.r2.toFixed(2) }}</code>
        <span class="metric-label">R²</span>
      </div>
    </div>
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
    top: 0,
    textStyle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
  },
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
    left: '20px',
    right: '20px',
    bottom: '50px',
    top: '50px',
    containLabel: true,
  },
  xAxis: {
    type: 'log',
    name: 'Production',
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
  yAxis: {
    type: 'log',
    name: 'Walden',
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

function calcR2(points) {
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const xbar = sumX / n;
  const ybar = sumY / n;

  const { sxx, syy, sxy } = points.reduce((acc, {x, y}) => {
    acc.sxx += (x - xbar) ** 2;
    acc.syy += (y - ybar) ** 2;
    acc.sxy += (x - xbar) * (y - ybar);
    return acc;
  }, { sxx: 0, syy: 0, sxy: 0 });

  const slope = sxy / sxx;
  const intercept = ybar - slope * xbar;

  const ssRes = points.reduce(
    (res, {x, y}) => res + (y - (slope * x + intercept)) ** 2,
    0
  );
  const r2 = 1 - ssRes / syy;

  return { slope, intercept, r2 };
}

function calceR2AgainstIdentity(points) {
  const n = points.length;
  const meanY = points.reduce((s,p)=>s+p.y,0) / n;

  let ssTot = 0, ssRes = 0;
  for (const {x, y} of points) {
    ssTot += (y - meanY) ** 2;
    ssRes += (y - x) ** 2;   // distance from y = x
  }
  return 1 - ssRes / ssTot;
}

function calcSpearmanRho(points) {
  const n = points.length;

  // Extract X and Y arrays
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  // Rank helper
  function rank(arr) {
    const sorted = [...arr].slice().sort((a,b)=>a-b);
    return arr.map(v => sorted.indexOf(v) + 1); // simple rank, no tie-handling
  }

  const rx = rank(xs);
  const ry = rank(ys);

  // Compute Pearson correlation of ranks
  const mean = arr => arr.reduce((a,b)=>a+b,0)/arr.length;
  const mx = mean(rx), my = mean(ry);

  let num = 0, dx = 0, dy = 0;
  for (let i=0; i<n; i++) {
    num += (rx[i]-mx)*(ry[i]-my);
    dx  += (rx[i]-mx)**2;
    dy  += (ry[i]-my)**2;
  }

  return num / Math.sqrt(dx*dy);
}

const r2Data = computed(() => {
  return (chartData.value.map(d => ({ x: d.prod, y: d.walden })));
});

const r2 = computed(() => {
  return calcR2(r2Data.value);
});

const identityLineR2 = computed(() => {
  return calceR2AgainstIdentity(r2Data.value);
});

const spearmanRho = computed(() => {
  return calcSpearmanRho(r2Data.value);
});


</script>

<style scoped>
.metrics {
  margin-right: 20px;
}
.metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 90px;
  border: 1px solid #e0e0e0;
  background-color: #fafafa;
  margin-bottom: 12px;
}
.metric-label {
  font-size: 14px;
}
.metric-value {
  font-size: 20px;
  font-weight: bold;
}
</style>

