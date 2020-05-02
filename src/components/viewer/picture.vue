<template>
  <v-tab-item>
    <v-progress-circular
      :size="100"
      :width="10"
      color="red"
      indeterminate
      style="margin: 20px"
      v-show="!loadCounter"
    />
    <v-row style="margin: 0; width: 100%">
      <template v-for="(fileName, index) in fileSee">
        <v-col :key="index" cols="3">
          <v-img
            :src="getFilePath(fileName)"
            @load="loadSuccess()"
            @click="dialogOpen(index)"
            style="width:100%;cursor:pointer"
          />
        </v-col>
      </template>
    </v-row>

    <v-dialog
      v-if="dialog.see"
      v-model="dialog.see"
      hide-overlay
      fullscreen
      transition="dialog-transition"
      content-class="b__picture-viewer"
      @keydown.right.exact="dialogChange()"
      @keydown.left.exact="dialogChange(true)"
      @keydown.up.exact="changeDir()"
      @keydown.down.exact="changeDir(true)"
    >
      <v-toolbar
        class="b__picture-viewer__toolbar"
        style="width: 200px;height: 130px"
      >
        <v-toolbar-title :cols="12">
          {{dialog.length}} / {{fileSee.concat(fileToSee).length}}
        </v-toolbar-title>

        <div>
          <v-text-field
            :rules="locationField.rules"
            v-model="locationField.value"
            label="go image"
            style="margin-top: 20px"
          ></v-text-field>
        </div>
      </v-toolbar>

      <v-img
        contain
        :src="nowPicturePath"
        style="width:initial;height:100vh"
      />
    </v-dialog>
  </v-tab-item>
</template>

<script>
import Vue from 'vue'
import path from 'path'
import { ipcRenderer } from 'electron'

export default Vue.extend({
  name: 'come__picture',
  props: {
    allFile: Array,
    nowPath: String,
    tableId: String
  },
  data () {
    return {
      loadCounter: 0,
      dialog: {
        see: false,
        length: 1
      },
      fileSee: [],
      locationField: {
        rules: [
          v => (!/\D/.test(v) && v <= this.allFile.length && v > 0) || `0 < input < ${this.allFile.length} && only number`
        ],
        value: 1
      }
    }
  },
  methods: {
    dialogOpen (index) {
      this.dialog.see = true
      this.dialog.length = index + 1
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    },
    dialogClose () {
      this.dialog.length = 1
      document.body.style.overflow = 'initial'
      document.body.style.height = 'initial'
    },
    dialogChange (isPrev) {
      this.dialog.length = (isPrev) ? this.dialog.length - 1 : this.dialog.length + 1

      if (this.dialog.length > this.allFile.length) this.dialog.length = 1
      else if (this.dialog.length < 1) this.dialog.length = this.allFile.length
    },
    loadSuccess () {
      this.loadCounter++

      if (this.loadCounter % 8 === 0) {
        this.fileToSee.splice(0, 8).map(item => {
          this.fileSee.push(item)
        })
      }
    },
    // garbage folder delete! dir is exist but no exist file folder
    getFilePath (fileName) {
      const nowPath = `file:///${path.join(this.nowPath, fileName).replace(/\\/g, '/')}`
      return nowPath
    },
    async changeDir (goPrev = false) {
      const splitPath = this.nowPath.split(path.sep)
      splitPath.splice(splitPath.length - 1, 1)
      const prevPath = splitPath.join(path.sep)

      ipcRenderer.send('get_next_picture-list', { tableId: this.tableId, query: { nowPath: prevPath }, nowPath: this.nowPath, goPrev })

      const nextFileResult = await new Promise(resolve => {
        ipcRenderer.once('get_next_picture-list', (ev, result) => {
          resolve(result)
        })
      })
      console.log(nextFileResult)
    }
  },
  watch: {
    'dialog.see' () {
      if (!this.dialog.see) this.dialogClose()
    },
    'locationField.value' () {
      if (typeof this.locationField.rules[0](this.locationField.value) !== 'string') {
        this.dialog.length = parseInt(this.locationField.value)
      }
    }
  },
  computed: {
    fileToSee () {
      return this.allFile.map(item => item.fileName)
    },
    nowPicturePath () {
      return this.getFilePath(this.fileSee.concat(this.fileToSee)[this.dialog.length - 1])
    }
  },
  created () {
    // picture numerically sort
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    })
    this.fileToSee.sort(collator.compare, null, 2)

    this.fileToSee.splice(0, 8).map(item => {
      this.fileSee.push(item)
    })
  },
  beforeDestroy () {
    if (this.dialog.see) this.dialogClose()
  }
})
</script>

<style lang="sass">
  .b__picture-viewer
    background: #000
    overflow: hidden
    text-align: center
    &__toolbar
      z-index: 10
      position: absolute
      top: 0
      bottom: 0
      left: 0
      opacity: 0
      transition: opacity .3s !important
      &:hover
        opacity: 1
      .v-toolbar__content
        display: block
</style>
