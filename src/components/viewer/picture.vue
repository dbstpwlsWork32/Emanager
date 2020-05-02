<template>
  <div class="b__dir-card">
    <v-card>
      picture
    </v-card>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'come__video',
  props: {
    tableId: String,
    docId: String,
    index: Number
  }
})
</script>
