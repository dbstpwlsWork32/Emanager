<template>
  <div class="main-content">
    <v-card v-if="folderList === false">
      folder list loading...
    </v-card>
    <v-card v-else-if="folderList.length === 0">
      <v-card-title>please set your folder!</v-card-title>
    </v-card>
    <v-card v-else>
      폴더가 있네용
    </v-card>

    <v-card class="addbox">
      <h2 class="title">Add Folder</h2>
      <v-text-field
        label="Folder Url"
        id="folder-url"
      ></v-text-field>
      <v-btn color="primary" v-on:click="addFolderList()">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <transition name="fade">
        <v-alert
          type="error"
          class="alert-error"
          dense
          v-if="addClickHandler.isClick && !addClickHandler.isExist"
        >can't find folder</v-alert>
      </transition>
    </v-card>
  </div>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import fs from 'fs'

export default Vue.extend({
  name: 'Home',
  data: () => ({
    folderList: false,
    addClickHandler: {
      isClick: false,
      isExist: false
    }
  }),
  created: function () {
    ipcRenderer.send('db_folderList')
    ipcRenderer.on('db_folderList_reply', (ev, args) => {
      this.$data.folderList = args
    })
  },
  methods: {
    addFolderList () {
      const urlEl = document.getElementById('folder-url')
      fs.access(urlEl.value, er => {
        this.$data.addClickHandler.isClick = true
        if (er) {
          this.$data.addClickHandler.isExist = false
        } else {
          this.$data.addClickHandler.isExist = true
        }
      })
    }
  }
})
</script>

<style lang="sass">
  main .main-content
    padding: 10px
    .addbox
      padding: 10px
      .title
        margin-botton: 5px
      button
        width: 100%
    .alert-error
      margin-top: 10px
    .fade-enter-active, .fade-leave-active
      transition: opacity 1s
    .fade-enter, .fade-leave-to
      opacity: 0
</style>
