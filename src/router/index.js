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
    {path: '/:pathMatch(.*)*', name: "PageNotFound", component: PageNotFound},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition; // Restore saved scroll position on back/forward
      } else {
        return { left: 0, top: 0 }; // Scroll to top for new pages
      }
    },
});

export default router;