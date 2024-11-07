// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  supabase: {
    redirect: true
  },

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/supabase',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/image',
    'nuxt-tiptap-editor',
    '@nuxtjs/leaflet'
  ],

  ui: {
    safelistColors: ['primary', 'red', 'orange', 'green']
  },
  // css: ['leaflet/dist/leaflet.css'],
  tiptap: {
    prefix: 'Tiptap'
  },

  colorMode: {
    disableTransition: true
  },
  // toast: {
  //   position: 'top-center',
  //   duration: 5000,
  //   register: [
  //     {
  //       name: 'serviceSuccess',
  //       message: 'Service request created successfully!',
  //       options: {
  //         type: 'success',
  //         icon: 'check-circle',
  //         duration: 10000,
  //         action: [
  //           {
  //             text: 'OK',
  //             onClick: (e, toastObject) => toastObject.goAway(0)
  //           },
  //           {
  //             text: 'Add Details',
  //             onClick: (e, toastObject) => {
  //               // Your logic for redirecting
  //               this.$router.push(`/services/customize/${this.newServiceId}`)
  //               toastObject.goAway(0)
  //             }
  //           }
  //         ]
  //       }
  //     }
  //   ]
  // },

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
    '@@/': '/',
    'stores': '/stores', // This alias points to your Pinia store directory
    'plugins': '/plugins'
  },
  watchers: {
    webpack: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.nuxt/**']
    }
  },
  compatibilityDate: '2024-07-11'
})