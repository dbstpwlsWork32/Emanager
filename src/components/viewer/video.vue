=<template>
  <v-row no-gutters align="stretch" class="b__video-viewer">
    <v-col cols="9">
      <v-card class="b__video-viewer__tv">
        <video controls v-if="nowPath">
          <source :src="`${nowPath}/${fileName}`" :type="`video/${fileName.split('.')[1]}`" />
          <track v-if="subtitle.path" :src="subtitle.path" kind="subtitles" default />
        </video>
      </v-card>
    </v-col>
    <v-col cols="3" class="b__video-viewer__collect">
      <h4 class="b__video-viewer__collect__info text-center">
        {{nowFileIndex + 1}} / {{videoFileList.length}}
      </h4>
      <div class="b__video-viewer__collect__list">
        <videoCard
          v-for="(file, index) in videoFileList"
          :key="file.fileName"
          :tableId="tableId"
          :docId="docId"
          :nowPath="nowPath"
          :fileObj="file"
          :disabled="nowFileIndex === index"
        />
      </div>
    </v-col>

    <v-dialog v-model="subtitle.dialog" persistent max-width="330">
      <v-card :loading="subtitle.proceed" :disabled="subtitle.proceed">
        <v-card-title class="headline">I found subtitle file whose extension is not .vtt!</v-card-title>
        <v-card-text>Can i convert to .vtt file and apply now video?</v-card-text>
        <v-card-actions v-if="!subtitle.proceed">
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="subtitle.agreeTask">Yes!</v-btn>
          <v-btn color="red darken-1" text @click="subtitle.dialog = false">No!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import Vue from 'vue'
import videoCard from '../dirCard/video'
import fs from 'fs'
import path from 'path'
import { ipcRenderer } from 'electron'
import subsrt from 'subsrt'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'

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
    fileName: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      nowPath: '',
      videoFileList: [],
      nowFileIndex: -1,
      subtitle: {
        path: '',
        dialog: false,
        agreeTask: null,
        proceed: false
      }
    }
  },
  methods: {
    async constructor () {
      // reset data
      this.videoFileList = []
      this.subtitle = {
        path: '',
        dialog: false,
        agreeTask: null,
        proceed: false
      }
      this.nowPath = ''

      // BIND DB RESULT
      ipcRenderer.send('find_child', { tableId: this.tableId, query: { _id: this.docId } })
      const [result] = await new Promise(resolve => {
        ipcRenderer.once('find_child', (e, rs) => {
          resolve(rs)
        })
      })

      this.nowPath = result.nowPath
      this.videoFileList = result.file
      this.nowFileIndex = result.file.map(item => item.fileName).indexOf(this.fileName)

      // FIND EXIST SUBTITLE FILE AS SAME NOW FILE NAME AND EXT IS ${subtitleExt}.vtt
      try {
        const subtitltPath = path.join(this.nowPath, path.parse(this.fileName).name + '.vtt')
        await fs.promises.stat(subtitltPath)

        this.subtitle.path = subtitltPath
      } catch {
        // if not exist and now directory, exist this.fileName + .${subtitleExt}, ask for consent and convert to .vtt and apply
        const subtitleExt = /sub|srt|sbv|vtt|ssa|ass|smi|lrc/
        let existSubtitle = ''
        let fastForBreak = false
        const nowVideoName = path.parse(this.fileName).name

        for (const nowFile of (await fs.promises.readdir(this.nowPath))) {
          if (!nowFile.match('.')) continue
          const nowFileParse = path.parse(nowFile)
          // if prev item is match nowVideoFile But current item is not match nowVideoFile, break for loop
          if (fastForBreak && !(nowFileParse.name === nowVideoName)) break

          if (nowFileParse.name === nowVideoName) {
            fastForBreak = true
            if (nowFileParse.ext.match(subtitleExt)) {
              existSubtitle = nowFile
              break
            }
          }
        }

        if (existSubtitle) {
          if (path.parse(existSubtitle).ext === 'vtt') {
            this.subtitle.path = path.join(this.nowPath, existSubtitle)
          } else {
            // if is not .vtt file get user agree and do convert and wait....
            this.subtitle.agreeTask = async () => {
              this.subtitle.proceed = true
              const subtitleBuffer = await fs.promises.readFile(path.join(this.nowPath, existSubtitle))
              const subtitleFormat = jschardet.detect(subtitleBuffer)
              const subtitleUtf8 = iconv.encode(iconv.decode(subtitleBuffer, subtitleFormat.encoding), 'utf-8').toString('utf-8')
              await fs.promises.writeFile(path.join(this.nowPath, path.parse(existSubtitle).name + '.vtt'), subsrt.convert(subtitleUtf8, { format: 'vtt' }))

              this.subtitle.path = path.join(this.nowPath, path.parse(existSubtitle).name + '.vtt')
              this.subtitle.proceed = false
              this.subtitle.dialog = false
              existSubtitle = null
            }
            this.subtitle.dialog = true
          }
        }
      }
    }
  },
  async created () {
    await this.constructor()
  },
  watch: {
    '$route' () {
      this.constructor()
    }
  },
  components: {
    videoCard
  }
})
</script>

<style lang="sass">
  .b__video-viewer
    &__tv, &__collect
      max-height: calc(100vh - 44px)
    &__collect
      overflow-y: auto
      &__info
        position: sticky
        top: 0
        z-index: 1
      .b__video-card
        margin: 0 10px 10px 10px
        &:last-child
          margin-bottom: 0
    &__tv
      video
        width: 100%
</style>
