import { createApp } from "vue";
import "uno.css";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import { Procedures } from "./generated/bindings";
import createRspc from "./plugins/rspc";

const pinia = createPinia();

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const i18n = createI18n({
    locale: "en",
    fallbackLocale: "en",
    legacy: false,
    messages: {
        en,
    },
});

const rspcPlugin = createRspc<Procedures>();

createApp(App).use(rspcPlugin).use(router).use(pinia).use(i18n).mount("#app");
