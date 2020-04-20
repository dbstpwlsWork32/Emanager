<template>
  <v-card
    :loading="isLoading"
    :disabled="isLoading"
    link
    :to="'/'+nowPath"
  >
    {{name}}
    {{process}}
  </v-card>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'come__oneDirectory',
  props: {
    isLoading: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    nowPath: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    process: {
      type: String
    }
  }
})
</script>

<style lang="sass">
  .b__folder-card
    flex-basis: 200px !important
    &_addFolder-open
      width: 100%
      border: 1px dashed #fff
</style>
