// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: '.',

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
  devServer: {
    port: 3001
  },
    postcss: {
    plugins: {
      "postcss-import": {},
      "tailwindcss/nesting": {},
      tailwindcss: {},
      autoprefixer: {},
    },
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
  css: ['~/assets/css/main.css', '/assets/font/stylesheet.css'],
})
