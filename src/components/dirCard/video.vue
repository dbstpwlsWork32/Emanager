<template>
  <v-col cols="4">
    <v-card class="b__videoCard" elevation="0">
      <v-img
        :src="thumbnailPath"
      />
      {{fileName}}
    </v-card>
  </v-col>
</template>

<script>
import Vue from 'vue'
import { VideoThumnail } from '../dirCard/thumbnail'

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
    fileName: {
      type: String,
      required: true
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
        fileBase: this.fileName
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

<style lang="sass">
  .b__videoCard
    background: none !important
</style>
