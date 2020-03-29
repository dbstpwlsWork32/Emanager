<template>
  <v-app>
     <Header />
     <Body />
     <Footer />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Header from './views/default/Header.vue'
import Body from './views/default/Body.vue'
import Footer from './views/default/Footer.vue'

export default Vue.extend({
  name: 'App',

  components: {
    Header,
    Body,
    Footer
  },

  data: () => ({
    //
  })
})
</script>
