<template>
  <div class="b__dir-card">
    <v-card
      :loading="dir.isLoading"
      :disabled="dir.isLoading"
      elevation="20"
      :img='nowThumnail'
    >
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
    </v-card>
  </div>
</template>

<script>
import Vue from 'vue'
import path from 'path'
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
      nowThumnail: null
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
      }
      return result
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
            user: {
              rate: newVal
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
  created () {
    const makeThumnailAsFile = async () => {
      const willVideoThumbnailPaths = []
      for (const file of this.dir.file) {
        if (
          this.thumbnail.length + willVideoThumbnailPaths.length >= 3 &&
          file.fileType === 'game'
        ) break

        if (file.fileType === 'picture') {
          this.thumbnail.push(path.join(this.dir.nowPath, file.fileName))
        } else if (file.fileType === 'video') {
          willVideoThumbnailPaths.push(path.join(this.dir.nowPath, file.fileName))
        }
      }

      if (willVideoThumbnailPaths.length) {
        await fetch('http://localhost:443/videoThumbnail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: willVideoThumbnailPaths })
        })
      }
    }

    if (!this.dir.file.length) makeThumnailAsFile()
  }
})
</script>

<style lang="sass">
  .b__dir-card
    position: relative
    width: 200px
    margin: 10px
    float: left
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
