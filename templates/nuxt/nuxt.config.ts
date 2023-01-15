import en from "./locales/en.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		"@nuxtjs/i18n",
		"@pinia/nuxt",
		"@vueuse/nuxt",
		"@unocss/nuxt",
	],
	experimental: {
		reactivityTransform: true,
	},
	css: ["@unocss/reset/tailwind.css"],
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
		vueI18n: {
			locale: "en",
			fallbackLocale: "en",
			legacy: false,
			messages: {
				en,
			},
		},
	},
});
