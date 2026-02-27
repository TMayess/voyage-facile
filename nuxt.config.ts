// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@nuxt/eslint"],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  supabase: {
    types: "~~/database.types.ts",
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/'], 
    }
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
    }
  },
  
  
})