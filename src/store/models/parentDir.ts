import { Module } from 'vuex'
import { ipcRenderer } from 'electron'
import { ParentDirModel } from '@/background/models/directory'

interface ParentDirListModel extends ParentDirModel {
  isLoading: boolean;
}

interface ParnetDirState {
  list: ParentDirListModel[];
}

const parentDir: Module<ParnetDirState, {}> = {
  namespaced: true,
  state () {
    return {
      list: []
    }
  },
  mutations: {
    add (state, parentDir: ParentDirListModel) {
      state.list.push(parentDir)
    },
    deleteByPath (state, path: string) {
      const dirPaths = state.list.map(item => item.path)
      const findDirByPath = dirPaths.indexOf(path)
      if (findDirByPath !== -1) state.list.splice(findDirByPath, 1)
    },
    modifyByPath <T extends ParentDirListModel> (state: ParnetDirState, { path, replace }: { path: string; replace: T }) {
      const dirPaths = state.list.map(item => item.path)
      const findDirByPath = dirPaths.indexOf(path)
      if (findDirByPath !== -1) {
        state.list[findDirByPath] = Object.assign(state.list[findDirByPath], replace)
      }
    }
  },
  actions: {
    load ({ commit }) {
      ipcRenderer.send('db_parentDirListLoad')
      ipcRenderer.once('db_parentDirListLoadreply', (ev, args: ParentDirListModel[]) => {
        args.forEach(item => {
          commit('add', item)
        })
      })
    },
    add ({ commit }, { name, path, isLoading }) {
      commit('add', { name, path, isLoading })

      ipcRenderer.send('db_insertDir', { path, name })
      return new Promise(resolve => {
        ipcRenderer.once('db_insertDir_reply', (ev, args) => {
          if (args) {
            commit('modifyByPath', { path, replace: { isLoading: false } })
            console.log('success!')
            resolve(true)
          } else {
            commit('deleteByPath', path)
            console.log('fail...')
            resolve(false)
          }
        })
      })
    }
  }
}

export default parentDir
