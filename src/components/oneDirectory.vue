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
      <v-tab v-if="fileSee.picture.length">Picture</v-tab>
      <v-tab v-if="fileSee.video.length">Video</v-tab>
      <v-tab v-if="fileSee.game.length">Game</v-tab>
      <v-tab v-if="dir.length">Folder : {{dir.length}}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="currentItem">

      <v-tab-item v-if="fileSee.picture.length">
        <template v-for="(fileName, index) in fileSee.picture">
          <v-img
            :src="getFilePath(fileName)"
            :key="index"
          >
          </v-img>
        </template>
      </v-tab-item>

      <v-tab-item v-if="fileSee.video.length">
        <template v-for="(fileName, index) in fileSee.video">
          <videoCard :src="getFilePath(fileName)" :key="index" />
        </template>
      </v-tab-item>

      <v-tab-item v-if="fileSee.game.length">
        <template v-for="(fileName, index) in fileSee.game">
          <v-btn
            :key="index"
            @click="externalProcessDoit(fileName)"
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
      dirPath: [],
      currentItem: '',
      fileToSee: {
        video: [],
        picture: [],
        game: []
      },
      fileSee: {
        video: [],
        picture: [],
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

        const rootName = this.$store.getters.rootTableName(this.tableId)
        this.folderName = this.nowPath.replace(rootName.nowPath, rootName.name)

        this.fileToSee = {
          video: [],
          picture: [],
          game: []
        }
        this.file.map(item => {
          this.fileToSee[item.fileType].push(item.fileName)
        })

        // picture numerically sort
        const collator = new Intl.Collator(undefined, {
          numeric: true,
          sensitivity: 'base'
        })
        this.fileToSee.picture.sort(collator.compare, null, 2)

        this.fileToSee.picture.splice(0, 8).map(item => {
          this.fileSee.picture.push(item)
        })
        this.fileToSee.video.splice(0, 8).map(item => {
          this.fileSee.video.push(item)
        })
        this.fileToSee.game.splice(0, 8).map(item => {
          this.fileSee.game.push(item)
        })
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
    getFilePath (fileName) {
      const nowPath = 'file:///' + path.join(this.nowPath, fileName).replace(/\\/, '/')
      return nowPath
    },
    externalProcessDoit (fileName) {
      shell.openItem(path.join(this.nowPath, fileName))
    },
    scrollEvent () {
      if (!(window.scrollY + window.innerHeight > document.body.scrollHeight - 400)) return false

      if (this.dirPath.length) {
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
