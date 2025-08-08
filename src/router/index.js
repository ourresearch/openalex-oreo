import { createRouter, createWebHistory } from 'vue-router';

import Oreo from "@/views/Oreo.vue";
import SamplesQA from "@/views/SamplesQA.vue";

import PageNotFound from "@/views/PageNotFound.vue";

const routes = [
    {path: '/', name: 'overview', component: Oreo, props: {mode: 'home'}},
    {path: '/entity/:entity', name: 'entity', component: Oreo, props: route => ({
        entityType: route.params.entity,
        mode: 'entity',
      })},
    {path: '/entity/:entity/list', name: 'list', component: Oreo, props: route => ({
        entityType: route.params.entity,
        mode: 'list',
      })},
    {path: '/entity/:entity/tests', name: 'tests', component: Oreo, props: route => ({
        entityType: route.params.entity,
        mode: 'tests',
    })},
    {path: '/samples', name: 'samples-qa', component: SamplesQA},
    {path: '/:pathMatch(.*)*', name: "PageNotFound", component: PageNotFound},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;