export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',

  nitro: {
    prerender: {
      routes: ['/', '/404.html'],  // Changed: Added '/' to generate index.html
      ignore: ['/dynamic-routes', '/api'],
      failOnError: false
    }
  },
  
  app: {
    head: {
      title: 'Flybeth Admin | System Control Tower',
      meta: [
        { name: 'description', content: 'Flybeth Administration — Global travel aggregator management console.' },
        { name: 'author', content: 'Flybeth' },
        { property: "og:image", content: "/logo.png" },
        { name: "twitter:image", content: "/logo.png" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/logo.png" },
      ]
    }
  },
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      // Backend ORIGIN only. The main backend's global prefix is `api/v1`, and
      // both `api_factory/axios.config.ts` and `composables/useApi.ts` append it
      // exactly once. Do NOT include `/api/v1` here (a trailing one is stripped
      // defensively by both consumers).
      apiBase: process.env.VITE_BASE_URL || process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      // Read by `composables/useMapboxGeolocation.ts` (reverse geocoding).
      mapboxAccessToken: process.env.NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    },
  },

    devServer: {
    // Must match the --port in package.json's dev script (3006).
    port: 3006,
    host: 'localhost'
  },

  googleFonts: {
    families: {
      "Inter": [400, 500, 600, 700],
      "Poppins": [400, 500, 600, 700],
      "Onest": [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    display: "swap",
    preload: true,
  },
  modules: ['@nuxtjs/tailwindcss', "@nuxtjs/google-fonts", "@nuxtjs/robots"],
  css: ['~/assets/css/main.css', '~/assets/font/stylesheet.css'],
})
