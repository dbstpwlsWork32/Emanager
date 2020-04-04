<template>
  <v-content id="body">
    <div class="l__body_content">
      <router-view></router-view>
    </div>
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
  .l__body_content
    padding: 10px
</style>
