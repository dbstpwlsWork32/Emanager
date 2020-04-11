import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // folderList: Array<FolderModel>()
    folderList: Array<string>()
  },
  mutations: {
    addFolderList (state, folderUrl: string) {
      state.folderList.push(folderUrl)
    },
    deleteFolderList (state, folderUrl: string) {
      state.folderList.splice(state.folderList.indexOf(folderUrl), 1)
    }
  },
  actions: {
  },
  modules: {
  }
})
