<template>
  <div class="b__dir-card">
    <v-card
      :loading="dir.isLoading"
      :disabled="dir.isLoading"
      elevation="20"
    >
      <v-list-item
        three-line
        link
        :to="`./${dir.linkPrepend}${dir._id}`"
      >
        <v-list-item-content>
          <div
            class="overline mb-4"
            v-if="dir.process"
          >{{dir.process}}</div>
          <v-list-item-title>{{dir.name}}</v-list-item-title>
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
          <v-list-item-subtitle v-if="userHandle.rate !== false">
            <v-rating
              :value="userHandle.rate"
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
const pathJoin = require('path').join

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
      thumbnail: []
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
    userHandle () {
      const defaultValue = {
        rate: 0
      }

      for (const key in defaultValue) {
        if (key in this.dir.user) {
          defaultValue[key] = this.dir.user[key]
        }
      }
      return defaultValue
    }
  },
  created () {
    const makeThumnailAsFile = () => {
      this.filePath = this.dir.file.map(item => {
        return pathJoin(this.dir.nowPath, item.fileName)
      })
    }

    if (this.dir.file.length) makeThumnailAsFile()
  }
})
</script>

<style lang="sass">
  @import './index'
</style>
