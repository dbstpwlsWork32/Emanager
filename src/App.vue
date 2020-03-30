<template>
  <v-app>
    <v-navigation-drawer
        permanent
        app
        width=180px
      >
      <Nav/>
    </v-navigation-drawer>
    <v-content>
      <Body />
    </v-content>

    <v-footer app default>
      <Footer />
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Nav from './views/default/Nav.vue'
import Body from './views/default/Body.vue'
import Footer from './views/default/Footer.vue'

export default Vue.extend({
  name: 'App',

  components: {
    Nav,
    Body,
    Footer
  },

  data: () => ({
    //
  })
})
</script>
