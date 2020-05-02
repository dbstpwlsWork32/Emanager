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
        <v-progress-circular
          :size="100"
          :width="10"
          color="red"
          indeterminate
          style="margin: 20px"
          v-show="!loadSuccessCounter.picture"
        />
        <v-row style="margin: 0; width: 100%">
          <template v-for="(fileName, index) in fileSee.picture">
            <v-col :key="index" cols="3">
              <v-img
                :src="getFilePath(fileName)"
                @load="loadSuccess('picture')"
                @click="openPictureWatcherOpen(index)"
                style="width:100%;cursor:pointer"
              />
            </v-col>
          </template>
        </v-row>
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
        style="min-height: 100vh"
      >
        <template v-for="(dir, index) in dir">
          <dirCard
            :dir="dir"
            :key="index"
          />
        </template>
      </v-tab-item>

    </v-tabs-items>

    <v-dialog
      v-if="pictureDialog.see"
      v-model="pictureDialog.see"
      hide-overlay
      fullscreen
      transition="dialog-transition"
      content-class="b__picture-viewer"
    >
        <img
          :src="getFilePath(fileSee.picture.concat(fileToSee.picture)[pictureDialog.index])"
          style="width:initial;height:100vh"
        />
    </v-dialog>
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
      },
      loadSuccessCounter: {
        picture: 0
      },
      pictureDialog: {
        see: false,
        index: 0
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
        this.folderName = this.nowPath.replace(rootName.nowPath, rootName.name).replace(/\\/g, '/')
        this.loadSuccessCounter.picture = 0
        if (this.pictureDialog.see) this.openPictureWatcherClose()

        this.fileToSee = {
          video: [],
          picture: [],
          game: []
        }
        this.fileSee = {
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

      this.scrollEvent()
    },
    getFilePath (fileName) {
      const nowPath = `file:///${path.join(this.nowPath, fileName).replace(/\\/g, '/')}`
      return nowPath
    },
    externalProcessDoit (fileName) {
      shell.openItem(path.join(this.nowPath, fileName))
    },
    scrollEvent () {
      if (!(window.scrollY + window.innerHeight > document.body.scrollHeight - 400)) return false

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
    },
    loadSuccess (type) {
      if (type === 'picture') {
        this.loadSuccessCounter.picture++

        if (this.loadSuccessCounter.picture % 8 === 0) {
          this.fileToSee.picture.splice(0, 8).map(item => {
            this.fileSee.picture.push(item)
          })
        }
      }
    },
    openPictureWatcherOpen (index) {
      this.pictureDialog.see = true
      this.pictureDialog.index = index
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    },
    openPictureWatcherClose () {
      this.pictureDialog.see = false
      this.pictureDialog.index = 0
      document.body.style.overflow = 'initial'
      document.body.style.height = 'initial'
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
  .b__picture-viewer
    background: #000
    overflow: hidden
    text-align: center
</style>
