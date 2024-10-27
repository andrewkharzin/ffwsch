// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  supabase: {
    redirect: true
  },

  modules: ['@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@nuxtjs/supabase', '@nuxt/eslint', '@nuxt/fonts', '@nuxt/ui', '@vueuse/nuxt', '@nuxt/image'],

  ui: {
    safelistColors: ['primary', 'red', 'orange', 'green']
  },

  colorMode: {
    disableTransition: true
  },

  routeRules: {
    // Temporary workaround for prerender regression. see https://github.com/nuxt/nuxt/issues/27490
    '/': { prerender: true }
  },

  devtools: {
    enabled: false
  },

  typescript: {
    strict: false
  },

  future: {
    compatibilityVersion: 4
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  alias: {
    '@': '/types',
    '~': '/assets',
    '@@/': '/',
    'stores': '/stores' // This alias points to your Pinia store directory
  },

  compatibilityDate: '2024-07-11'
})
