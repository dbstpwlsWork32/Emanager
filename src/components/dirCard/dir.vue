<template>
  <v-card
    :loading="dir.isLoading"
    :disabled="dir.isLoading"
    elevation="20"
    :img='nowThumnail'
    class="b__dir-card"
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
import { ipcRenderer } from 'electron'

export default Vue.extend({
  name: 'come__oneDirectory',
  props: {
    dir: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      thumbnail: [],
      nowThumnail: null,
      menu: [
        {
          title: 'Update',
          callback: this.docUpdate
        },
        {
          title: 'Delete',
          callback: this.docDelete
        }
      ],
      showMenu: false,
      position: {
        x: 0,
        y: 0
      },
      syncDialog: false
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
      const isRoot = this.$store.getters.rootTableName(this.dir.tableId).nowPath === this.dir.nowPath
      this.syncDialog = true
      ipcRenderer.send('docDelete', { tableId: this.dir.tableId, nowPath: this.dir.nowPath, isRoot })
      ipcRenderer.once('docDelete', () => {
        if (isRoot) {
          this.$store.commit('deleteByPath', this.dir.nowPath)
        } else {
          this.$emit('dirDelete', this.dir._id)
        }
        this.syncDialog = false
      })
    },
    docUpdate () {
      ipcRenderer.send('docSync', { tableId: this.dir.tableId, nowPath: this.dir.nowPath })
      ipcRenderer.once('docSync', () => {
        this.syncDialog = false
      })
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
    }
  },
  beforeDestroy () {
    this.showMenu = false
  }
})
</script>

<style lang="sass">
  .b__dir-card
    position: relative
    width: 200px
    margin: 10px
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
