<template>
  <v-row>
    <v-toolbar flat>
      <v-toolbar-title>{{folderName}}</v-toolbar-title>
    </v-toolbar>

    <v-tabs>
      <v-tab v-if="file.length">Files</v-tab>
      <v-tab v-if="dir.length">Folder</v-tab>

      <v-tab-item v-if="file.length">
        <template v-for="(fObj, index) in file">
          <v-img
            v-if="fObj.fileType === 'picture'"
            :key="index"
            :src="getFilePath(fObj)"
          ></v-img>
          <videoCard
            v-else-if="fObj.fileType === 'videoa'"
            :key="index"
            :src="getFilePath(fObj)"
          />
          <v-btn
            v-else-if="fObj.fileType === 'game'"
            :key="index"
            @click="externalProcessDoit(fObj)"
          >
            {{fObj.fileName}}
          </v-btn>
        </template>
      </v-tab-item>

      <v-tab-item v-if="dir.length">
        <template v-for="(dir, index) in dir">
          <dirCard
            :key="index"
            :dir="dir"
          />
        </template>
      </v-tab-item>
    </v-tabs>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import dirCard from '@/components/dirCard/dir'
import videoCard from '@/components/dirCard/video'
import path from 'path'
import { spawn } from 'child_process'

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
        this.dir = result.dir.map(dir => {
          return { ...dir, name: path.parse(dir.nowPath).base }
        })
        this.file = result.file
        this.overall = result.overall
        this.nowPath = result.nowPath
      })
    },
    getFilePath (fObj) {
      return path.join(this.nowPath, fObj.fileName)
    },
    externalProcessDoit (fObj) {
      const doIt = spawn('start',
        [
          '""',
          `${this.nowPath}`,
          `${fObj.fileName}`
        ]
      )

      doIt.on('error', err => {
        alert(err)
        throw new Error(err)
      })
    }
  },
  computed: {
    folderName () {
      return this.name || this.nowPath
    }
  },
  watch: {
    '$route' () {
      this.insertDocument(this.tableId, this.docId)
    }
  },
  created () {
    this.insertDocument(this.tableId, this.docId)
  },
  components: {
    dirCard,
    videoCard
  }
})
</script>
