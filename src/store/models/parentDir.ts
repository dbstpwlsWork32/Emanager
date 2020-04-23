import { Module } from 'vuex'
import { ipcRenderer } from 'electron'
import { ParentDirModel } from '@/database/models/directory'

interface ParentDirListModel extends ParentDirModel {
  isLoading: boolean;
  process: string;
  _id: string;
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
    deleteByPath (state, nowPath: string) {
      const dirPaths = state.list.map(item => item.nowPath)
      const findDirByPath = dirPaths.indexOf(nowPath)
      if (findDirByPath !== -1) state.list.splice(findDirByPath, 1)
    },
    modifyByPath (state: ParnetDirState, { nowPath, replace }: { nowPath: string; replace: ParentDirListModel }) {
      const dirPaths = state.list.map(item => item.nowPath)
      const findDirByPath = dirPaths.indexOf(nowPath)
      if (findDirByPath !== -1) {
        state.list[findDirByPath] = Object.assign(state.list[findDirByPath], replace)
      }
    }
  },
  actions: {
    load ({ commit }) {
      ipcRenderer.send('db_find_parent', {})
      ipcRenderer.once('db_find_parent', (ev, args: ParentDirModel[]) => {
        args.forEach(item => {
          commit('add', item)
        })
      })
    },
    add ({ commit }, { name, nowPath, isLoading }) {
      commit('add', { name, nowPath, isLoading, process: 'start', overall: [], _id: '' })

      ipcRenderer.send('db_firstInsert-dir', { nowPath, name })
      return new Promise((resolve, reject) => {
        ipcRenderer.once('db_firstInsert-dir_reply-setStructure', () => {
          commit('modifyByPath', { nowPath, replace: { process: 'set structure...' } })
        })
        ipcRenderer.once('db_firstInsert-dir_reply-insertDb', () => {
          commit('modifyByPath', { nowPath, replace: { process: 'insert at db...' } })
        })
        ipcRenderer.once('db_firstInsert-dir_reply', (ev, result) => {
          if (result) {
            resolve()
          } else {
            commit('deleteByPath', nowPath)
            reject(new Error('db insert error'))
          }
        })
      }).then(() => {
        return new Promise((resolve, reject) => {
          ipcRenderer.send('db_find_parent', { nowPath })
          ipcRenderer.once('db_find_parent', (ev, result) => {
            if (result === false) {
              reject(new Error(`db find error\n query: {${nowPath}}`))
            } else {
              commit('modifyByPath', { nowPath, replace: { isLoading: false, process: '', _id: result[0]._id, overall: result[0].overall } })
              resolve(true)
            }
          })
        })
      }).catch(er => {
        throw new Error(`add dir : \n${er}`)
      })
    }
  }
}

export default parentDir
