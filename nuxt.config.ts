// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@nuxt/eslint", '@nuxtjs/leaflet'],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    foursquareApiKey: process.env.FOURSQUARE_API_KEY,
    locationiqApiKey: process.env.LOCATIONIQ_API_KEY,
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
  },

supabase: {
  types: "~~/database.types.ts",
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY,
  
  redirectOptions: {
    login: '/login',
    callback: '/confirm',
    exclude: ['/', '/register','/forgot-password', '/reset-password', '/itinerary-details', '/itinerary-details/**',],
  }
},

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
    }
  },
  
  
})