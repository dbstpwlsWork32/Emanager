import Vue from 'vue'
import Vuex from 'vuex'
import {
  // FolderModel,
  FolderListModel
} from './models/folder'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // folderList: Array<FolderModel>()
    folderList: Array<FolderListModel>()
  },
  mutations: {
    addFolderList (state, folderUrl: string) {
      state.folderList.push(folderUrl)
    },
    deleteFolderList (state, folderModel: string) {
      state.folderList.splice(state.folderList.indexOf(folderModel), 1)
    }
  },
  actions: {
  },
  modules: {
  }
})
