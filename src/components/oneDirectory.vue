<template>
  <v-row>
    <v-banner single-line>{{folderName}}</v-banner>
    <template>
      <v-card>
        {{tableId}}, {{docId}}
      </v-card>
    </template>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'

export default Vue.extend({
  name: 'come__oneDirectory',
  data () {
    return {
      dir: [],
      file: [],
      overall: [],
      nowPath: ''
    }
  },
  props: ['tableId', 'docId'],
  methods: {
    insertDocument (tableId, docId) {
      ipcRenderer.send('db_oneDirRequest', { tableId, docId })
      ipcRenderer.once('db_oneDirRequest', (ev, result) => {
        this.dir = result.dir
        this.file = result.file
        this.overall = result.overall
        this.nowPath = result.nowPath
      })
    }
  },
  computed: {
    folderName () {
      return this.name || this.nowPath
    }
  },
  watch: {
    '$route' (to, from) {
      console.log(to)
      console.log(from)
      console.log(this.tableId, this.docId)
      this.insertDocument(this.tableId, this.docId)
    }
  },
  created () {
    this.insertDocument(this.tableId, this.docId)
  }
})
</script>
