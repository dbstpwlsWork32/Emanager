<template>
  <div class="l__home">
    <v-card
      v-for="folder in folderList"
      :key="folder"
      class="l__home_folder-list"
    >
      <v-icon color="rgb(254, 201, 40)">mdi-folder</v-icon>
      <v-card-subtitle>{{folder}}</v-card-subtitle>
    </v-card>

    <v-card class="l__home_folder-list">
      <v-img
        src="../../dist/aa.jpg"
      ></v-img>
      <v-icon color="rgb(254, 201, 40)">mdi-folder</v-icon>
      <v-card-subtitle>asdasddsadas</v-card-subtitle>
      <v-progress-circular
        indeterminate
        color="primary"
        :size=50
        link
        to='/s'
      ></v-progress-circular>
    </v-card>

    <div class="l__home_folder-list bt">
      <v-dialog v-model="dialog" width="500px" content-class="l__home_dialog">
        <template v-slot:activator="{ on }">
          <v-btn
            text
            v-on="on"
            class="l__home_folder-list_addFolder-open"
            color="#fff"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>Add Folder</v-card-title>
          <v-card-text>
            <v-text-field
              label="Folder Url"
              id="folder-url"
            ></v-text-field>
            <v-btn color="primary" class="addBt" v-on:click="addFolderList()">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-text>
          <transition name="fade">
            <v-alert
              type="error"
              class="alert-error"
              dense
              v-if="addClickHandler.isClick && !addClickHandler.isExist"
            >{{addClickHandler.alertError}}</v-alert>
          </transition>
          <v-btn
            class="close"
            text
            background-color="#1976d2"
            @click="dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import fs from 'fs'

export default Vue.extend({
  name: 'Home',
  data: () => ({
    dialog: false,
    addClickHandler: {
      isClick: false,
      isExist: false,
      alertError: ''
    }
  }),
  computed: {
    folderList () {
      return this.$store.state.folderList
    }
  },
  created: function () {
    ipcRenderer.send('db_folderList')
    ipcRenderer.once('db_folderList_reply', (ev, args) => {
      args.forEach(item => {
        this.$store.commit('addFolderList', item.path)
      })
    })
  },
  methods: {
    addFolderList () {
      const urlEl = document.getElementById('folder-url')
      fs.access(urlEl.value, er => {
        this.$data.addClickHandler.isClick = true
        if (er) {
          this.$data.addClickHandler.isExist = false
          this.$data.addClickHandler.alertError = 'Can\'t Find Folder'
        } else if (this.$store.state.folderList.includes(urlEl.value)) {
          this.$data.addClickHandler.isExist = false
          this.$data.addClickHandler.alertError = 'Already Exist Folder'
        } else {
          this.$data.addClickHandler.isExist = true
          this.$data.dialog = false
          this.$store.commit('addFolderList', urlEl.value)

          ipcRenderer.send('db_addFolderList', urlEl.value)
          ipcRenderer.once('db_addFolderList_reply', (ev, args) => {
            if (args) console.log('success!')
            else console.log('fail...')
          })
        }
      })
    }
  }
})
</script>

<style lang="sass">
  .l__home
    &:after
      content: ''
      display: block
      clear: both
    &_dialog
      .addBt
        width: 100%
      .fade-enter-active, .fade-leave-active
        transition: opacity .2s
      .fade-enter, .fade-leave-to
        opacity: 0
      .close
        position: absolute
        right: 0
        top: 0

    &_folder-list
      width: 135px
      height: 150px
      float: left
      margin-right: 10px
      margin-bottom: 10px
      &:last-child
        margin-right: 0
      &_addFolder-open
        width: 135px
        height: 150px !important
        width: 100%
        border: 1px dashed #fff
</style>
