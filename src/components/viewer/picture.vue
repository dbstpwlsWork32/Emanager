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
            @load="loadSuccess('picture')"
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
      @keydown.right.prevent="dialogChange()"
      @keydown.left.prevent="dialogChange(true)"
    >
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" class="b__picture-viewer-tips" dark v-on="on">Help</v-btn>
        </template>
        <span>Help</span>
      </v-tooltip>
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

export default Vue.extend({
  name: 'come__picture',
  props: {
    allFile: Array,
    nowPath: String
  },
  data () {
    return {
      loadCounter: 0,
      dialog: {
        see: false,
        index: 0
      },
      fileSee: []
    }
  },
  methods: {
    dialogOpen (index) {
      this.dialog.see = true
      this.dialog.index = index
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    },
    dialogClose () {
      this.dialog.index = 0
      document.body.style.overflow = 'initial'
      document.body.style.height = 'initial'
    },
    dialogChange (isPrev) {
      this.dialog.index = (isPrev) ? this.dialog.index - 1 : this.dialog.index + 1

      if (this.dialog.index > this.allFile.length - 1) this.dialog.index = 0
      else if (this.dialog.index < 0) this.dialog.index = this.allFile.length - 1
    },
    loadSuccess () {
      this.loadCounter++

      if (this.loadCounter % 8 === 0) {
        this.fileToSee.splice(0, 8).map(item => {
          this.fileSee.push(item)
        })
      }
    },
    getFilePath (fileName) {
      const nowPath = `file:///${path.join(this.nowPath, fileName).replace(/\\/g, '/')}`
      return nowPath
    }
  },
  watch: {
    'dialog.see' () {
      if (!this.dialog.see) this.dialogClose()
    }
  },
  computed: {
    fileToSee () {
      return this.allFile.map(item => item.fileName)
    },
    nowPicturePath () {
      return this.getFilePath(this.fileSee.concat(this.fileToSee)[this.dialog.index])
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
    &-tips
      position: absolute
      width: 10px
      height: 10px
      background: none
      opacity: .5
      left: 0
      top: 0
</style>
