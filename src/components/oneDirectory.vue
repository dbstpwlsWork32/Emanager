<template>
  <v-row id="oneDirectiory">
    <v-banner
      single-line
      width="100%"
    >
      {{folderName}}
    </v-banner>

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

      <v-tab-item
        v-if="dir.length"
      >
        <template v-for="(dir, index) in dir">
            <dirCard
              :dir="dir"
              :key="index"
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
      nowPath: '',
      folderName: ''
    }
  },
  props: ['tableId', 'docId'],
  methods: {
    resetDocument (tableId, docId) {
      const migration = result => {
        this.dir = result.dir
        this.file = result.file
        this.overall = result.overall
        this.nowPath = result.nowPath

        const rootName = this.$store.getters.rootTableName(this.tableId)
        this.folderName = this.nowPath.replace(rootName.nowPath, rootName.name)
      }

      const tableIndex = this.$store.getters.tableCacheIndex(tableId)
      const docIndex = this.$store.getters.tableCacheDocIndex(tableIndex, docId)

      if (docIndex === -1) {
        ipcRenderer.send('db_oneDirRequest', { tableId, docId })
        ipcRenderer.once('db_oneDirRequest', (ev, result) => {
          result.dir = result.dir.map(item => {
            return {
              ...item,
              name: path.parse(item.nowPath).base
            }
          })
          migration(result)
          this.$store.commit('tableCacheAdd', {
            tableId,
            docValue: {
              _id: docId,
              ...result
            }
          })
        })
      } else {
        migration(this.$store.getters.tableCacheDoc(tableIndex, docIndex))
      }
    },
    getFilePath (fObj) {
      return path.join(this.nowPath, fObj.fileName)
    },
    externalProcessDoit (fObj) {
      const doIt = spawn('start',
        [
          '""',
          '/d',
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
    isAllLoad () {
      return this.$store.state.isAllLoad
    }
  },
  watch: {
    '$route' () {
      this.resetDocument(this.tableId, this.docId)
    },
    'isAllLoad' (to) {
      if (to === true) this.resetDocument(this.tableId, this.docId)
    }
  },
  created () {
    if (this.isAllLoad === true) this.resetDocument(this.tableId, this.docId)
  },
  components: {
    dirCard,
    videoCard
  }
})
</script>

<style lang="sass">
  #oneDirectiory
    .theme--light.v-tabs-items
      background-color: none !important
</style>
