import Vue from 'vue'
import Vuex from 'vuex'
import { FolderListModel } from './models/folder'
import { ipcRenderer } from 'electron'

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
    },
    modifyFolderList (state, { path, replace }: { path: string; replace: object }) {
      const pathOfFolder = state.folderList.map(item => item.path)
      const toReplaceIndex = pathOfFolder.indexOf(path)
      state.folderList.splice(toReplaceIndex, 1, { ...state.folderList[toReplaceIndex], ...replace })
    }
  },
  actions: {
    addFolderList ({ commit }, { name, path, isLoading }) {
      commit('addFolderList', { name, path, isLoading })

      ipcRenderer.send('db_addFolderList', { path, name })
      return new Promise(resolve => {
        ipcRenderer.once('db_addFolderList_reply', (ev, args) => {
          if (args) {
            commit('modifyFolderList', { path, replace: { isLoading: false } })
            console.log('success!')
            resolve(true)
          } else {
            commit('deleteFolderList', path)
            console.log('fail...')
            resolve(false)
          }
        })
      })
    }
  },
  modules: {
  }
})
