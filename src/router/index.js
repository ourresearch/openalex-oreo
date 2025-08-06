import { createRouter, createWebHistory } from 'vue-router';

import Oreo from "@/views/Oreo.vue";
import XpacQA from "@/views/XpacQA.vue";
import SamplesQA from "@/views/SamplesQA.vue";

import PageNotFound from "@/views/PageNotFound.vue";

const routes = [
    {path: '/', redirect: '/works'},
    {path: '/xpac', name: 'xpac-qa', component: XpacQA},
    {path: '/samples', name: 'samples-qa', component: SamplesQA},
    {path: '/:mode', name: 'oreo', component: Oreo, props: true},
    {path: '/:pathMatch(.*)*', name: "PageNotFound", component: PageNotFound},
];


const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;