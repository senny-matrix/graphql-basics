// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-side only: the real GraphQL endpoint. Never shipped to the browser.
    graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || 'http://127.0.0.1:4000/graphql',
  },

  // Proxy /graphql to the Yoga server. The browser only ever talks to the Nuxt
  // origin, so the frontend needs no CORS configuration and the backend URL can
  // be changed without rebuilding.
  nitro: {
    routeRules: {
      '/graphql': { proxy: `${process.env.GRAPHQL_ENDPOINT || 'http://127.0.0.1:4000/graphql'}` },
    },
  },

  app: {
    head: {
      title: 'GraphQL Basics',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A Nuxt frontend consuming the GraphQL Basics API' },
      ],
    },
  },
})
