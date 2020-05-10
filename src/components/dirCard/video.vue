<template>
  <v-card
    class="b__video-card"
    elevation="0"
    link
    :disabled="disabled"
    :to="`/video/${tableId}/${docId}/${fileObj.fileName}`"
  >
    <div
      v-if="thumbnailPath === ''"
      style="width:100%;padding-bottom:55%;background:#000;"
    ></div>
    <v-img
      :src="thumbnailPath"
      aspect-ratio="1.8"
    />

    <h3 class="subtitle-1" style="padding: 5px 5px 0 5px">{{fileObj.fileName}}</h3>
    <span class="caption" style="padding: 0 0 0 5px">{{cTime}}</span>
  </v-card>
</template>

<script>
import Vue from 'vue'
import { VideoThumnail } from '../thumbnail'

export default Vue.extend({
  name: 'come__videoCard',
  props: {
    tableId: {
      type: String,
      required: true
    },
    docId: {
      type: String,
      required: true
    },
    nowPath: {
      type: String,
      required: true
    },
    fileObj: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      thumbnailPath: ''
    }
  },
  methods: {
    async getThumbnail () {
      const thumbnail = new VideoThumnail({
        tableId: this.tableId,
        docId: this.docId,
        nowPath: this.nowPath,
        fileBase: this.fileObj.fileName
      })

      const thumbnailPath = await thumbnail.getThumbnail()
      this.thumbnailPath = thumbnailPath.replace(/\\/g, '/')

      this.$nextTick(() => {
        this.$store.commit('backgroundProceed', -1)
      })

      return false
    }
  },
  computed: {
    canProceed () {
      return this.$store.state.proceedBackground <= 1
    },
    cTime () {
      const time = new Date(this.fileObj.ctime)
      return `${time.getFullYear()}.${time.getMonth()}.${time.getDate()}`
    }
  },
  watch: {
    'canProceed' () {
      if (this.canProceed && this.thumbnailPath === '') {
        this.$store.commit('backgroundProceed', 1)
        this.getThumbnail()
      }
    }
  },
  created () {
    if (this.canProceed) {
      this.$store.commit('backgroundProceed', 1)
      this.getThumbnail()
    }
  }
})
</script>
