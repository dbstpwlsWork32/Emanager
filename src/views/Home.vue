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
        v-for="(dir, index) in parentDirList"
        :key="index"
      >
        <dirCard
          :name="dir.name"
          :nowPath="dir.nowPath"
          :process="dir.process"
          :isLoading="dir.isLoading"
        ></dirCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import fs from 'fs'
import comDirCard from '@/components/dirCard'

export default Vue.extend({
  name: 'Home',
  data () {
    return {
      dialog: false,
      addClickHandler: {
        isError: false,
        isExist: false,
        alertError: ''
      },
      userInput: {
        url: '',
        name: ''
      }
    }
  },
  computed: {
    parentDirList () {
      return this.$store.state.parentDir.list
    }
  },
  created () {
    if (!this.parentDirList.length) {
      this.$store.dispatch('parentDir/load')
    }
  },
  methods: {
    addFolderList () {
      if (!this.$data.userInput.url || !this.$data.userInput.name) {
        this.$data.addClickHandler.isError = true
        this.$data.addClickHandler.alertError = 'please write all form'
      } else {
        fs.access(this.$data.userInput.url, er => {
          const matchOfPathList = this.parentDirList.map(item => item.nowPath).filter(item => {
            const replace = item.replace(/[^\w\s]/g, '\\$&')
            return this.$data.userInput.url.match(new RegExp('^' + replace))
          })
          const matchOfNameList = this.parentDirList.map(item => item.name).filter(item => item.match(this.$data.userInput.name))
          if (er) {
            this.$data.addClickHandler.isError = true
            this.$data.addClickHandler.alertError = 'Can\'t Find Folder'
          } else if (matchOfPathList.length > 0 || matchOfNameList.length > 0) {
            this.$data.addClickHandler.isError = true
            this.$data.addClickHandler.alertError = (matchOfPathList.length > 0) ? 'Already Exist Folder' : 'Already Exist name'
          } else {
            this.$data.addClickHandler.isError = false
            this.$data.dialog = false

            this.$store.dispatch('parentDir/add', { name: this.$data.userInput.name, nowPath: this.$data.userInput.url, isLoading: true })
              .then(result => {
                if (!result) alert('something is wrong!')
              })
          }
        })
      }
    }
  },
  components: {
    dirCard: comDirCard
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
