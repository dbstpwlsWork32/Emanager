<template>
  <v-content id="body">
    <v-container
      fluid
    >
      <router-view></router-view>
    </v-container>
  </v-content>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Body',
  created () {
    if (!this.$store.state.rootTableList.length) {
      this.$store.dispatch('load')
    }
  }
})
</script>

<style lang="sass">
  #body
    background: radial-gradient(#4C5771, #20262C)
</style>
