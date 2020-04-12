<template>
  <v-container class="l__home flex-wrap">
    <v-row>
      <v-col>
        <div class="b__folder-card">
          <v-dialog v-model="dialog" width="500px" content-class="l__home_dialog">
            <template v-slot:activator="{ on }">
              <v-btn
                text
                v-on="on"
                class="b__folder-card_addFolder-open"
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
                  v-model="userInput.url"
                ></v-text-field>
                <v-text-field
                  label="naming"
                  v-model="userInput.name"
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
                  v-if="addClickHandler.isError"
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
      </v-col>

      <v-col
        v-for="(folder, index) in folderList"
        :key="index"
      >
        <v-card
          :loading="isFolderLoading[folder.path]"
          :disabled="isFolderLoading[folder.path]"
          link
          :to="'/'+folder.path"
        >
          {{folder.name + isFolderLoading[folder.path]}}
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
      isError: false,
      isExist: false,
      alertError: ''
    },
    isFolderLoading: {},
    userInput: {
      url: '',
      name: ''
    }
  }),
  computed: {
    folderList () {
      return this.$store.state.folderList
    }
  },
  created () {
    if (!this.$store.state.folderList.length) {
      ipcRenderer.send('db_folderList')
      ipcRenderer.once('db_folderList_reply', (ev, args) => {
        console.log(args)
        args.forEach(({ path, name }) => {
          this.$store.commit('addFolderList', { path, name })
        })
      })
    }
  },
  methods: {
    addFolderList () {
      if (!this.$data.userInput.url || !this.$data.userInput.name) {
        this.$data.addClickHandler.isError = true
        this.$data.addClickHandler.alertError = 'please write all form'
        return
      }

      fs.access(this.$data.userInput.url, er => {
        const pathOfFolder = this.$store.state.folderList.map(item => item.path)
        if (er) {
          this.$data.addClickHandler.isError = true
          this.$data.addClickHandler.alertError = 'Can\'t Find Folder'
        } else if (pathOfFolder.includes(this.$data.userInput.url)) {
          this.$data.addClickHandler.isError = true
          this.$data.addClickHandler.alertError = 'Already Exist Folder'
        } else {
          this.$data.addClickHandler.isError = false
          this.$data.dialog = false

          this.$store.commit('addFolderList', { name: this.$data.userInput.name, path: this.$data.userInput.url })
          this.$data.isFolderLoading[this.$data.userInput.url] = true

          ipcRenderer.send('db_addFolderList', { path: this.$data.userInput.url, name: this.$data.userInput.name })
          ipcRenderer.once('db_addFolderList_reply', (ev, args) => {
            this.$data.isFolderLoading[this.$data.userInput.url] = false
            console.log(this.$data.isFolderLoading)
            if (args) {
              console.log('success!')
            } else {
              this.$store.commit('deleteFolderList', this.$data.userInput.url)
              console.log('fail...')
              alert('something is wrong!')
            }
          })
        }
      })
    }
  }
})
</script>

<style lang="sass">
  .l__home
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

  .b__folder-card
    flex-basis: 200px !important
    &_addFolder-open
      width: 100%
      border: 1px dashed #fff
</style>
