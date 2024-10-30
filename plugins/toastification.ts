import type { PluginOptions } from 'vue-toastification'
import Toast, { POSITION } from 'vue-toastification'
import { defineNuxtPlugin } from '#app'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    hideProgressBar: false
  }

  nuxtApp.vueApp.use(Toast, options)

  // Add `$toast` to Nuxt app instance
  nuxtApp.provide('toast', nuxtApp.vueApp.config.globalProperties.$toast)
})
