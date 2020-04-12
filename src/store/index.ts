import Vue from 'vue'
import Vuex from 'vuex'
import { FolderListModel } from './models/folder'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // folderList: Array<FolderModel>()
    folderList: Array<FolderListModel>()
  },
  mutations: {
    addFolderList (state, folder: FolderListModel) {
      state.folderList.push(folder)
    },
    deleteFolderList (state, path: string) {
      const pathOfFolder = state.folderList.map(item => item.path)
      state.folderList.splice(pathOfFolder.indexOf(path), 1)
    }
  },
  actions: {
  },
  modules: {
  }
})
