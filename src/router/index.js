import { createRouter, createWebHistory } from 'vue-router';

import Oreo from "@/views/Oreo.vue";
import SamplesQA from "@/views/SamplesQA.vue";

import PageNotFound from "@/views/PageNotFound.vue";

const routes = [
    {path: '/', name: 'overview', component: Oreo, props: {mode: 'coverage'}},
    {path: '/entity/:entity', redirect: to => {return {path: `/entity/${to.params.entity}/list`}}},
    {path: '/entity/:entity/list', name: 'list', component: Oreo, props: route => ({
        entityType: route.params.entity,
        mode: 'works',
      })},
    {path: '/entity/:entity/tests', name: 'tests', component: Oreo, props: route => ({
        entityType: route.params.entity,
        mode: 'summary',
    })},
    {path: '/samples', name: 'samples-qa', component: SamplesQA},
    {path: '/:pathMatch(.*)*', name: "PageNotFound", component: PageNotFound},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;