<template>
  <div class="b__dir-card">
    <v-card>
      <video controls>
        <source :src="src" :type="`video/${src.split('.')[1]}`" />
      </video>
    </v-card>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'come__video',
  props: {
    src: {
      type: String,
      required: true
    }
  }
})
</script>
