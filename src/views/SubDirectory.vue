<template>
  <v-row>
    <v-col cols=12>
      <h3 class="white--text headline">-Files-</h3>
      {{$route.params.parent}}
    </v-col>
  </v-row>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'subDirectory',
  methods: {
  },
  data () {
    return {
      rootResult: {}
    }
  }
})
</script>

<style lang="sass">
</style>
