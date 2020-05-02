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
      <v-tab v-if="fileStat.picture.length">Picture</v-tab>
      <v-tab v-if="fileStat.video.length">Video</v-tab>
      <v-tab v-if="fileStat.game.length">Game</v-tab>
      <v-tab v-if="dir.length">Folder : {{dir.length}}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="currentItem">

      <pictureViewer
        v-if="fileStat.picture.length"
        :allFile="fileStat.picture"
        :nowPath="nowPath"
      />

      <v-tab-item v-if="fileStat.video.length">
        <template v-for="(fObj, index) in fileStat.video">
          <videoCard :src="getFilePath(fObj.fileName)" :key="index" />
        </template>
      </v-tab-item>

      <v-tab-item v-if="fileStat.game.length">
        <template v-for="(fObj, index) in fileStat.game">
          <v-btn
            :key="index"
            @click="externalProcessDoit(fObj.fileName)"
          >
            {{fObj.fileName}}
          </v-btn>
        </template>
      </v-tab-item>

      <v-tab-item
        v-if="dir.length"
        class="tab-item-wrapper"
        style="min-height: 80vh"
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
import pictureViewer from '@/components/viewer/picture'
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
      dirPath: [],
      currentItem: '',
      fileStat: {
        picture: [],
        video: [],
        game: []
      }
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

        this.fileStat = {
          picture: [],
          video: [],
          game: []
        }
        this.file.map(item => {
          this.fileStat[item.fileType].push(item)
        })

        const rootName = this.$store.getters.rootTableName(this.tableId)
        this.folderName = this.nowPath.replace(rootName.nowPath, rootName.name).replace(/\\/g, '/')
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

      this.scrollEvent(true)
    },
    getFilePath (fileName) {
      const nowPath = `file:///${path.join(this.nowPath, fileName).replace(/\\/g, '/')}`
      return nowPath
    },
    externalProcessDoit (fileName) {
      shell.openItem(path.join(this.nowPath, fileName))
    },
    scrollEvent (repeat) {
      if (!(window.scrollY + window.innerHeight > document.body.scrollHeight - 200)) {
        repeat = false
        return false
      }

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
          if (repeat) this.scrollEvent()
          window.addEventListener('scroll', this.scrollEvent)
        }
      })
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
    videoCard,
    pictureViewer
  }
})
</script>

<style lang="sass">
  #oneDirectiory
    .v-tabs-items
      background: none !important
</style>
