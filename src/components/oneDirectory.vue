<template>
  <v-row id="one-directiory">
    <v-banner
      single-line
      width="100%"
      sticky
      class="one-directory__banner"
    >
      {{folderName}}
    </v-banner>

    <v-toolbar
      dark
      background-color="blue darken-3"
    >
      <v-row>
        <v-col cols="4">
          <v-text-field
            prepend-icon="mdi-magnify"
            style="top: 9px; position: relative"
            v-model="search.text"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            style="top: 9px"
            :items="search.sort.items"
            v-model="search.sort.select"
          />
        </v-col>
        <v-col cols="3">
          <v-btn-toggle
            mandatory
          >
            <v-btn>
              <v-icon>mdi-arrow-down</v-icon>
            </v-btn>
            <v-btn>
              <v-icon>mdi-arrow-up</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-toolbar>

    <v-tabs v-model="currentItem">
      <v-tab v-if="dir.length">Folder: {{dir.length}}</v-tab>
      <v-tab v-if="fileStat.picture.length">Picture: {{fileStat.picture.length}}</v-tab>
      <v-tab v-if="fileStat.video.length">Video: {{fileStat.video.length}}</v-tab>
      <v-tab v-if="fileStat.game.length">Game: {{fileStat.game.length}}</v-tab>
      <v-tab v-if="fileStat.audio.length">audio: {{fileStat.audio.length}}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="currentItem">

      <v-tab-item
        v-if="dir.length"
        class="tab-item-wrapper"
      >
        <v-row no-gutters>
          <dirCard
            v-for="dir in dir"
            :dir.sync="dir"
            :key="dir._id"
            v-on:dirDelete="deleteDir"
          />
        </v-row>
      </v-tab-item>

      <v-tab-item v-if="fileStat.picture.length">
        <pictureViewer
          :fileObjs="fileStat.picture"
          :nowPath="nowPath"
          :tableId="tableId"
        />
      </v-tab-item>

      <v-tab-item v-if="fileStat.video.length">
        <v-row no-gutters>
          <v-col md="4" lg="3" v-for="file in fileStat.video" :key="file.fileName">
            <videoCard
              :tableId="tableId"
              :docId="docId"
              :nowPath="nowPath"
              :fileObj="file"
              style="margin: 10px"
            />
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item v-if="fileStat.game.length">
        <template v-for="fObj in fileStat.game">
          <v-btn
            class="one-directory__button"
            :key="fObj.fileName"
            @click="externalProcessDoit(fObj.fileName)"
          >
            {{fObj.fileName}}
          </v-btn>
        </template>
      </v-tab-item>

      <v-tab-item
        v-if="fileStat.audio.length"
      >
        <audio
          v-for="fObj in fileStat.audio"
          controls
          :src="getFilePath(fObj.fileName)"
          :key="fObj.fileName"
        ></audio>
      </v-tab-item>

    </v-tabs-items>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer, shell } from 'electron'
import dirCard from '@/components/dirCard/dir'
import videoCard from './dirCard/video'
import pictureViewer from '@/components/viewer/picture'
import path from 'path'
import { filePathUrl } from '@/defaultModule'

export default Vue.extend({
  name: 'come__oneDirectory',
  data () {
    return {
      dir: [],
      file: [],
      overall: [],
      user: {},
      nowPath: '',
      dirPath: [],
      currentItem: '',
      fileStat: {
        picture: [],
        video: [],
        game: [],
        audio: []
      },
      folderName: '',
      search: {
        text: '',
        ascending: false,
        sort: {
          select: 'name',
          items: [
            'name',
            'favorite',
            'created'
          ]
        }
      }
    }
  },
  props: ['tableId', 'docId'],
  methods: {
    async resetDocument (tableId, docId) {
      const migration = async result => {
        this.dir = result.dir
        this.file = result.file
        this.overall = result.overall
        this.nowPath = result.nowPath
        this.dirPath = result.dirPath
        this.user = result.user

        this.fileStat = {
          picture: [],
          video: [],
          game: [],
          audio: []
        }
        this.file.map(item => {
          this.fileStat[item.fileType].push(item)
        })

        const rootName = this.$store.getters.rootTableName(this.tableId)
        this.folderName = this.nowPath.replace(rootName.nowPath, rootName.name).replace(/\\/g, '/')
      }

      ipcRenderer.send('db_oneDirRequest', { tableId, query: { _id: docId } })
      const dbResult = await new Promise((resolve) => {
        ipcRenderer.once('db_oneDirRequest', (ev, result) => {
          result.dir = result.dir.map(item => {
            return {
              ...item,
              name: path.parse(item.nowPath).base
            }
          })
          resolve(result)
        })
      })
      migration(dbResult)

      if (this.dirPath.length) this.scrollEvent(true)
    },
    getFilePath (fileName) {
      return `file:///${filePathUrl(path.join(this.nowPath, fileName))}`
    },
    externalProcessDoit (fileName) {
      shell.openItem(path.join(this.nowPath, fileName))
    },
    scrollEvent (repeat) {
      if (window.scrollY + window.innerHeight <= document.documentElement.scrollHeight - 300) {
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
        this.dir = this.dir.concat(result)
        this.$nextTick(() => {
          if (this.dirPath.length) {
            if (repeat) this.scrollEvent(repeat)
            window.addEventListener('scroll', this.scrollEvent)
          }
        })
      })
    },
    deleteDir (docId) {
      this.dir.splice(this.dir.map(item => item._id).indexOf(docId), 1)
    }
  },
  computed: {
    rootAllLoad () {
      return this.$store.state.isAllLoad
    },
    rate: {
      get: function () {
        return this.dir.user.rate || 0
      },
      set: function (newVal) {
        ipcRenderer.send('tableModify', {
          tableId: this.dir.tableId,
          docId: this.dir._id,
          replace: {
            $set: {
              user: {
                rate: newVal
              }
            }
          }
        })
        ipcRenderer.once('tableModify', rs => {
          if (!rs) alert('update fail')
        })
      }
    }
  },
  watch: {
    '$route' () {
      if (this.rootAllLoad === true) {
        this.resetDocument(this.tableId, this.docId)
      }
    },
    'rootAllLoad' (to) {
      if (to === true) {
        this.resetDocument(this.tableId, this.docId)
      }
    }
  },
  created () {
    if (this.rootAllLoad === true) {
      this.resetDocument(this.tableId, this.docId)
    }
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.scrollEvent)
  },
  components: {
    dirCard,
    videoCard,
    pictureViewer
  }
})
</script>

<style lang="sass">
  #one-directiory
    .v-tabs-items
      background: none !important
      width: 100%
  .one-directory
    &__button
      margin-top: 10px
    &__banner
      z-index: 2 !important
</style>
