<template>
  <v-row no-gutters>
    <template
      v-for="file in fileList"
    >
      <videoCard
        :key="file"
        :tableId="tableId"
        :docId="docId"
        :nowPath="nowPath"
        :fileName ="file"
      />
    </template>
  </v-row>
</template>

<script>
import Vue from 'vue'
import videoCard from '../dirCard/video'

export default Vue.extend({
  name: 'come__videoviewer',
  props: {
    tableId: {
      type: String,
      required: true
    },
    docId: {
      type: String,
      required: true
    },
    fileList: {
      type: Array,
      required: true
    },
    nowPath: {
      type: String,
      required: true
    }
  },
  methods: {
    getThumbnail (fileName) {
      console.log(fileName)
      return null
    }
  },
  components: {
    videoCard
  }
})
</script>

<style lang="sass">
  .b__video-viewer
    background: none !important
</style>
