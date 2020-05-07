<template>
  <v-card
    :loading="dir.isLoading"
    :disabled="dir.isLoading"
    elevation="20"
    :img='nowThumbnail'
    class="b__dir-card"
    :class="{ 'exist-thumbnail': nowThumbnail }"
    @click.right="menuTask"
  >
    <v-menu
      v-model="showMenu"
      :position-x="position.x"
      :position-y="position.y"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in menu"
          :key="index"
          @click="item.callback"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-list-item
      three-line
      link
      :to="`/openDir/${dir.tableId}/${dir._id}`"
    >
      <v-list-item-content>
        <div
          class="overline mb-4"
          v-if="dir.process"
        >{{dir.process}}</div>
        <v-list-item-title>{{folderName}}</v-list-item-title>
        <v-list-item-subtitle>{{dir.nowPath}}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider class="mx-4"></v-divider>

    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          <v-tooltip
            v-for="(type, index) in dir.overall"
            :key="index"
            top
          >
            <template
              v-slot:activator="{ on }"
            >
              <v-icon v-on="on">{{getIconTextByType(type.type)}}</v-icon>
            </template>
            <span>{{type.count}}</span>
          </v-tooltip>
        </v-list-item-title>
        <v-list-item-subtitle v-if="this.dir.user.rate !== false">
          <v-rating
            v-model="rate"
            dense
            hover
            size="20"
            full-icon="mdi-heart"
            empty-icon="mdi-heart-outline"
            background-color="grey lighten-1"
            color="red lighten-3"
          ></v-rating>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-dialog
      v-model="syncDialog"
      persistent
      hide-overlay
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          Please stand by
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer, shell } from 'electron'
import { ThumbnailDir } from './thumbnail'

export default Vue.extend({
  name: 'come__oneDirectory-simple',
  props: {
    dir: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      nowThumbnail: null,
      menu: [
        {
          title: 'Update',
          callback: this.docUpdate
        },
        {
          title: 'Delete',
          callback: this.docDelete
        },
        {
          title: 'Reveal File Explore',
          callback: () => {
            shell.showItemInFolder(this.dir.nowPath)
          }
        }
      ],
      showMenu: false,
      position: {
        x: 0,
        y: 0
      },
      syncDialog: false,
      shouldThumbnail: false
    }
  },
  methods: {
    getIconTextByType (type) {
      let result = ''
      switch (type) {
        case 'picture':
          result = 'mdi-image'
          break
        case 'video':
          result = 'mdi-video'
          break
        case 'game':
          result = 'mdi-gamepad-variant'
          break
        case 'audio':
          result = 'mdi-file-music'
          break
      }
      return result
    },
    menuTask (e) {
      e.preventDefault()
      this.showMenu = false
      this.position.x = e.clientX
      this.position.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    docDelete () {
      const rootPath = this.$store.getters.rootTableName(this.dir.tableId).nowPath
      const isRoot = rootPath === this.dir.nowPath

      this.syncDialog = true
      ipcRenderer.send('docDelete', { tableId: this.dir.tableId, nowPath: this.dir.nowPath, isRoot, rootPath })
      ipcRenderer.once('docDelete', () => {
        this.syncDialog = false
        if (isRoot) {
          this.$store.commit('deleteByPath', this.dir.nowPath)
        } else {
          const rootOverall = this.$store.getters.rootOverall(this.dir.tableId)
          const thisOverallTypeList = this.dir.overall.map(item => item.type)

          const newRootOverall = rootOverall.map(item => {
            const index = thisOverallTypeList.indexOf(item.type)
            if (index !== -1) {
              return {
                type: item.type,
                count: (item.count - this.dir.overall[index].count)
              }
            } else {
              return item
            }
          })

          this.$store.commit('modifyByPath', { nowPath: rootPath, replace: { overall: newRootOverall } })
          this.$nextTick(() => {
            this.$emit('dirDelete', this.dir._id)
          })
        }
      })
    },
    docUpdate () {
      this.syncDialog = true
      ipcRenderer.send('docSync', { tableId: this.dir.tableId, nowPath: this.dir.nowPath })
      ipcRenderer.once('docSync', (e, { rootOverall, dirOverall }) => {
        this.$nextTick(() => {
          this.syncDialog = false
        })

        if (rootOverall) {
          this.$store.commit('modifyByPath', {
            nowPath: this.$store.getters.rootTableName(this.dir.tableId).nowPath,
            replace: {
              overall: rootOverall
            }
          })
        }

        if (dirOverall) {
          this.$emit('update:dir', Object.assign(this.dir, { overall: dirOverall }))
        }
      })
    },
    async getThumbnail () {
      const thumbnail = new ThumbnailDir({
        tableId: this.dir.tableId,
        docId: this.dir._id,
        nowPath: this.dir.nowPath,
        file: this.dir.file
      })

      let thumbnailPath = await thumbnail.getDirThumbnail()
      if (thumbnailPath === false) {
        thumbnailPath = await thumbnail.makeDirThumbnail()

        this.nowThumbnail = thumbnailPath.replace(/\\/g, '/')
      } else if (thumbnailPath !== false) {
        this.nowThumbnail = thumbnailPath.replace(/\\/g, '/')
      }

      this.$nextTick(() => {
        this.$store.commit('backgroundProceed', -1)
      })

      return false
    }
  },
  computed: {
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
    },
    folderName () {
      return this.dir.name || this.dir.nowPath
    },
    canProceed () {
      return this.$store.state.proceedBackground <= 2
    }
  },
  watch: {
    'canProceed' () {
      if (this.canProceed && this.shouldThumbnail && !this.nowThumbnail) {
        this.$store.commit('backgroundProceed', 1)
        this.getThumbnail()
      }
    }
  },
  created () {
    const overallType = this.dir.overall.map(item => item.type)
    this.shouldThumbnail = this.dir.file.length && (overallType.indexOf('picture') !== -1 || overallType.indexOf('video') !== -1)

    if (this.shouldThumbnail && this.canProceed) {
      this.$store.commit('backgroundProceed', 1)
      this.getThumbnail()
    }
  },
  beforeDestroy () {
    this.showMenu = false
    this.syncDialog = false
  }
})
</script>

<style lang="sass">
  .b__dir-card
    position: relative
    width: 200px
    margin: 10px
    &.exist-thumbnail
      .v-list-item
        position: relative
        z-index: 1
        &:after
          content: ''
          display: block
          position: absolute
          top: 0
          left: 0
          right: 0
          bottom: 0
          background-color: #000
          opacity: .3
          z-index: -1
        &__content
          color: #e6e6e6 !important
        &__subtitle, .v-icon
          color: #c7c7c7 !important
  .b__dir-card
    &_addDir-open
      width: 100%
      border: 1px dashed #fff
    &_details
      position: absolute !important
      top: 50% !important
      right: 0
      transform: translate(100%, -50%)
      background-color: #eaf3ff !important
</style>
