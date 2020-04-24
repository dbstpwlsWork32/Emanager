<template>
  <div class="b__dir-card">
    <v-card
      :loading="dir.isLoading"
      :disabled="dir.isLoading"
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
          <v-list-item-subtitle>
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
import { ipcRenderer } from 'electron'

export default Vue.extend({
  name: 'come__oneDirectory',
  props: {
    dir: {
      type: Object,
      required: true
    },
    user: Object,
    tableId: String
  },
  data () {
    return {
      sumnailPath: [],
      showDetails: {
        show: false,
        task: false
      }
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
    },
    getSumnail () {
      ipcRenderer.send('db_find_child', {
        _id: this.tableId,
        query: {
          file: {
            $elemMatch: {
              fileType: 'picture'
            }
          }
        },
        additional: [
          { sort: { ctime: 1 } },
          { limit: 2 }
        ]
      })
      ipcRenderer.once('db_find_child', (ev, rs) => {
        console.log(this.dir.name)
        console.log(rs)
      })
    }
  },
  computed: {
    userHandle () {
      const defaultValue = {
        rate: 0,
        views: 11
      }

      for (const key in defaultValue) {
        if (key in this.user) {
          defaultValue[key] = this.user[key]
        }
      }

      return defaultValue
    },
    allLoadValue () {
      this.getSumnail()
      return this.$store.state.parentDir.isAllLoad
    }
  }
})
</script>

<style lang="sass">
  @import './index'
</style>
