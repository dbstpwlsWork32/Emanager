import Vue from 'vue'
import Vuex from 'vuex'
import {
  FolderModel
} from './models/folder'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    folderList: Array<FolderModel>()
  },
  mutations: {
    addFolderList (state, folderModel: FolderModel) {
      state.folderList.push(folderModel)
    }
  },
  actions: {
    addFolderList (context, folderUrl: string) {
      return context.commit('addFolderList')
    }
  },
  modules: {
  }
})
