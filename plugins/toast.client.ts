// plugins/toast.client.ts
import type { PluginOptions } from 'vue-toastification'
import Toast from 'vue-toastification'
import { defineNuxtPlugin } from '#app'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    // You can define options here
    position: 'top-right',
    timeout: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6
  }

  nuxtApp.vueApp.use(Toast, options)
})
