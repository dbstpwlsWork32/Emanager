<template>
  <v-content id="body">
    <router-view></router-view>
  </v-content>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Body'
})
</script>

<style lang="sass">
  #body
    background-color: #4c5061
</style>
