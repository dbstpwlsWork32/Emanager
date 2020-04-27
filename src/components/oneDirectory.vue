<template>
  <v-card></v-card>
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
