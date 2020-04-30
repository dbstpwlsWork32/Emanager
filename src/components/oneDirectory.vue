<template>
  <v-row id="oneDirectiory">
    <v-banner
      single-line
      width="100%"
      sticky
    >
      {{folderName}}
    </v-banner>

    <v-tabs v-model="currentItem">
      <v-tab v-if="file.length">Files</v-tab>
      <v-tab v-if="dir.length">Folder</v-tab>
    </v-tabs>

    <v-tabs-items v-model="currentItem">
      <v-tab-item v-if="file.length">
        <template v-for="(fObj, index) in file" style="position: sticky">
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
        class="tab-item-wrapper"
        style="min-height: 280px"
      >
        <template v-for="(dir, index) in dir">
            <dirCard
              :dir="dir"
              :key="index"
            />
        </template>
      </v-tab-item>
    </v-tabs-items>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer, shell } from 'electron'
import dirCard from '@/components/dirCard/dir'
import videoCard from '@/components/dirCard/video'
import path from 'path'

export default Vue.extend({
  name: 'come__oneDirectory',
  data () {
    return {
      dir: [],
      file: [],
      overall: [],
      nowPath: '',
      folderName: '',
      dirLength: 0,
      dirPath: [],
      currentItem: 'now item'
    }
  },
  props: ['tableId', 'docId'],
  methods: {
    async resetDocument (tableId, docId) {
      const migration = result => {
        this.dir = result.dir
        this.file = result.file
        this.overall = result.overall
        this.nowPath = result.nowPath
        this.dirPath = result.dirPath

        const rootName = this.$store.getters.rootTableName(this.tableId)
        this.folderName = this.nowPath.replace(rootName.nowPath, rootName.name)
      }

      ipcRenderer.send('db_oneDirRequest', { tableId, docId })
      await new Promise((resolve) => {
        ipcRenderer.once('db_oneDirRequest', (ev, result) => {
          result.dir = result.dir.map(item => {
            return {
              ...item,
              name: path.parse(item.nowPath).base
            }
          })
          migration(result)
          resolve()
        })
      })
    },
    getFilePath (fObj) {
      return path.join(this.nowPath, fObj.fileName)
    },
    externalProcessDoit (fObj) {
      shell.openItem(path.join(this.nowPath, fObj.fileName))
    },
    scrollEvent () {
      if (window.scrollY + window.innerHeight > document.body.scrollHeight - 400) {
        window.removeEventListener('scroll', this.scrollEvent)
        ipcRenderer.send('getChildDirDocs', {
          tableId: this.tableId,
          childList: this.dirPath.splice(0, 15),
          startDirIndex: this.dir.length - 1
        })
        ipcRenderer.once('getChildDirDocs', (ev, result) => {
          result = result.map(item => {
            return {
              ...item,
              name: path.parse(item.nowPath).base
            }
          })
          for (const childDir of result) {
            this.dir.push(childDir)
          }
          if (this.dirPath.length) {
            window.addEventListener('scroll', this.scrollEvent)
          }
        })
      }
    }
  },
  computed: {
    rootAllLoad () {
      return this.$store.state.isAllLoad
    }
  },
  watch: {
    '$route' () {
      if (this.rootAllLoad === true) {
        this.resetDocument(this.tableId, this.docId)
          .then(() => {
            if (this.dirPath.length !== 0) {
              window.addEventListener('scroll', this.scrollEvent)
            }
          })
      }
    },
    'rootAllLoad' (to) {
      if (to === true) {
        this.resetDocument(this.tableId, this.docId)
          .then(() => {
            if (this.dirPath.length !== 0) {
              window.addEventListener('scroll', this.scrollEvent)
            }
          })
      }
    }
  },
  created () {
    if (this.rootAllLoad === true) {
      this.resetDocument(this.tableId, this.docId)
        .then(() => {
          if (this.dirPath.length !== 0) {
            window.addEventListener('scroll', this.scrollEvent)
          }
        })
    }
  },
  components: {
    dirCard,
    videoCard
  }
})
</script>

<style lang="sass">
  #oneDirectiory
    .v-tabs-items
      background: none !important
</style>
