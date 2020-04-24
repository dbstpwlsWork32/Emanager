<template>
  <v-app>
    <Nav/>
    <Body/>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Nav from './views/default/Nav.vue'
import Body from './views/default/Body.vue'

export default Vue.extend({
  name: 'App',
  components: {
    Nav,
    Body
  }
})
</script>

<style lang="sass">
  html
    overflow: auto !important
</style>
