import { createRouter, createWebHistory } from 'vue-router';

import Oreo from "@/views/Oreo.vue";
import SamplesQA from "@/views/SamplesQA.vue";

import PageNotFound from "@/views/PageNotFound.vue";

const routes = [
    {path: '/', name: 'overview', component: Oreo, props: {mode: 'home'}},
    {path: '/samples', name: 'samples-qa', component: SamplesQA},
    {path: '/:entity', name: 'entity', component: Oreo, props: route => ({
        entityType: route.params.entity,
        mode: 'entity',
      })},
    {path: '/:entity/tests', name: 'tests', component: Oreo, props: route => ({
        entityType: route.params.entity,
        mode: 'tests',
    })},
    {path: '/:entity/tests/:testKey', name: 'list', component: Oreo, props: route => ({
      entityType: route.params.entity,
      testKey: route.params.testKey,
      mode: 'list',
    })},
    {path: '/:entity/plots/:plotKey', name: 'plots', component: Oreo, props: route => ({
      entityType: route.params.entity,
      plotKey: route.params.plotKey,
      mode: 'plots',
    })},
    {path: '/:pathMatch(.*)*', name: "PageNotFound", component: PageNotFound},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition; // Restore saved scroll position on back/forward
      } else if (to.name === 'plots' || from.name === 'plots') {
        return false; // don't scroll
      }
      else {
        return { left: 0, top: 0 }; // Scroll to top for new pages
      }
    },
});

// Query keys to persist globally
const PERSIST = ['sample']

router.beforeEach((to, from) => {

  // carry missing keys from the previous route
  const q = { ...to.query }; 
  let changed = false;
  for (const k of PERSIST) if (q[k] == null && from.query?.[k] != null) {
    q[k] = from.query[k]; changed = true
  }
  return changed ? { ...to, query: q, replace: true } : true
})

export default router;