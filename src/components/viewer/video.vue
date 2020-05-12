=<template>
  <v-row no-gutters align="stretch" class="b__video-viewer">
    <v-col cols="9">
      <v-card class="b__video-viewer__tv">
        <video controls v-if="videoSrc"
          @focus="videoTagBlur"
          @ended="videoEndEvent"
          @loadstart="addDocKeyEvent"
        >
          <source :src="videoSrc" :type="`video/${videoExt}`" />
          <track v-if="subtitle.path" :src="subtitle.path" kind="subtitles" default />
        </video>

        <v-fade-transition>
          <v-overlay absolute color="#000" v-if="videoEnd.overlay">
            <p>Next : {{this.videoFileList[this.nowFileIndex + 1].fileName}}</p>
            <p>{{this.videoEnd.duration}}%</p>
          </v-overlay>
        </v-fade-transition>
      </v-card>
    </v-col>
    <v-col cols="3" class="b__video-viewer__collect">
      <h4 class="b__video-viewer__collect__info text-center white--text" style="background:#2f8dd0">
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

    <v-dialog v-model="video.dialog" persistent max-width="330">
      <v-card>
        <v-card-title class="headline">can't play {{videoExt}} video extension</v-card-title>
        <v-card-text>play with external player?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="video.openExternal">Yes!</v-btn>
          <v-btn color="red darken-1" text @click="video.dialog = false">No!</v-btn>
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
import { ipcRenderer, shell } from 'electron'
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
    fileBase: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      nowPath: '',
      videoFileList: [],
      videoSrc: '',
      nowFileIndex: -1,
      subtitle: {
        path: '',
        dialog: false,
        agreeTask: null,
        proceed: null
      },
      before: {
        tableId: '',
        docId: ''
      },
      videoExt: '',
      video: {
        dialog: false,
        openExternal: null,
        el: null
      },
      videoEnd: {
        overlay: false,
        duration: 0,
        interval: null
      }
    }
  },
  methods: {
    async constructor () {
      // reset data
      this.removeDocKeyEvent()
      this.subtitle.path = ''
      this.nowPath = ''
      this.videoSrc = ''

      // BIND DB RESULT
      ipcRenderer.send('find_child', { tableId: this.tableId, query: { _id: this.docId } })
      const [dbResult] = await new Promise(resolve => {
        ipcRenderer.once('find_child', (e, rs) => {
          resolve(rs)
        })
      })

      this.nowPath = dbResult.nowPath

      if (this.docId !== this.before.docId && this.tableId !== this.before.tableId && this.videoFileList.length !== dbResult.file.length) {
        this.videoFileList = dbResult.file
      }
      this.nowFileIndex = dbResult.file.map(item => item.fileName).indexOf(this.fileBase)
      this.before.tableId = this.tableId
      this.before.docId = this.docId

      const nowVideoFileParse = path.parse(this.fileBase)
      this.videoExt = nowVideoFileParse.ext.replace('.', '')

      const videoSupExt = /mp4$|ogg$|webm$/i
      if (nowVideoFileParse.ext.match(videoSupExt)) {
        this.videoSrc = path.join(this.nowPath, this.fileBase)
        this.subtitleTask()
      } else {
        this.video.openExternal = () => {
          shell.openExternal(path.join(this.nowPath, this.fileBase))
          this.video.dialog = false
        }
        this.video.dialog = true
      }
    },
    async subtitleTask () {
      const nowVideoFileParse = path.parse(this.fileBase)
      // FIND EXIST SUBTITLE FILE AS SAME NOW FILE NAME AND EXT IS ${subtitleExt}.vtt
      try {
        const subtitltPath = path.join(this.nowPath, nowVideoFileParse.name + '.vtt')
        await fs.promises.stat(subtitltPath)

        this.subtitle.path = subtitltPath
      } catch {
        // if not exist and now directory, exist this.fileName + .${subtitleExt}, ask for consent and convert to .vtt and apply
        const subtitleExt = /sub$|srt$|sbv$|vtt$|ssa$|ass$|smi$|lrc$/i
        let existSubtitle = ''
        let fastForBreak = false
        const nowVideoName = nowVideoFileParse.name

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

              const newSubtitleDest = path.join(this.nowPath, path.parse(existSubtitle).name + '.vtt')
              const subtitleBuffer = await fs.promises.readFile(path.join(this.nowPath, existSubtitle))
              const subtitleFormat = jschardet.detect(subtitleBuffer)
              const subtitleUtf8 = iconv.encode(iconv.decode(subtitleBuffer, subtitleFormat.encoding), 'utf-8').toString('utf-8')
              await fs.promises.writeFile(newSubtitleDest, subsrt.convert(subtitleUtf8, { format: 'vtt' }))

              this.subtitle.path = newSubtitleDest
              this.subtitle.proceed = false
              this.subtitle.dialog = false
              existSubtitle = null
            }
            this.subtitle.dialog = true
          }
        }
      }
    },
    addDocKeyEvent (e) {
      if (!this.video.el) {
        this.video.el = e.target
        document.addEventListener('keydown', this.videoEventByKeyDown)
      }
    },
    removeDocKeyEvent (e) {
      if (this.video.el) {
        this.video.el = null
        document.removeEventListener('keydown', this.videoEventByKeyDown)
      }
    },
    videoEventByKeyDown (e) {
      switch (e.key) {
        case 'ArrowRight':
          this.video.el.currentTime += 5
          break
        case 'ArrowLeft':
          this.video.el.currentTime -= 5
          break
        case ' ':
          if (this.video.el.paused) {
            this.video.el.play()
          } else {
            this.video.el.pause()
          }
          break
      }
    },
    videoTagBlur (e) {
      e.target.blur()
    },
    videoEndEvent () {
      this.videoEnd.overlay = true

      if (this.nowFileIndex + 1 < this.videoFileList.length) {
        this.videoEnd.interval = setInterval(() => {
          this.videoEnd.duration += 1
          if (this.videoEnd.duration >= 100) {
            this.videoEnd.overlay = false
            this.videoEnd.duration = 0
            clearInterval(this.videoEnd.interval)
            this.$router.replace(`/video/${this.tableId}/${this.docId}/${this.videoFileList[this.nowFileIndex + 1].fileName}`)
          }
        }, 40)
      }
    }
  },
  async created () {
    await this.constructor()
  },
  beforeDestroy () {
    this.removeDocKeyEvent()
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
