<template>
  <v-card>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { ipcRenderer } from 'electron'

export default Vue.extend({
  name: 'Home',
  beforeMount: function () {
    ipcRenderer.send('dbLoad')
    ipcRenderer.on('dbLoad_reply', (ev, args) => {
      console.log(args)
    })
  }
})
</script>
