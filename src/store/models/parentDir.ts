import { Module } from 'vuex'
import { ipcRenderer } from 'electron'
import { DirDocumentModel, NEDBRootTable } from '@/database/models/directory'

interface RootTableModel extends DirDocumentModel {
  isLoading: boolean;
  process: string;
  _id: string;
  tableId: string;
}

interface RootTableState {
  rootTableList: RootTableModel[];
  isAllLoad: boolean;
}

const parentDir: Module<RootTableState, {}> = {
  namespaced: true,
  state () {
    return {
      rootTableList: [],
      isAllLoad: false
    }
  },
  mutations: {
    add (state, rootPath: RootTableModel) {
      state.rootTableList.push(rootPath)
    },
    deleteByPath (state, nowPath: string) {
      const dirPaths = state.rootTableList.map(item => item.nowPath)
      const findDirByPath = dirPaths.indexOf(nowPath)
      if (findDirByPath !== -1) state.rootTableList.splice(findDirByPath, 1)
    },
    modifyByPath (state, { nowPath, replace }: { nowPath: string; replace: RootTableModel }) {
      const dirPaths = state.rootTableList.map(item => item.nowPath)
      const findDirByPath = dirPaths.indexOf(nowPath)
      if (findDirByPath !== -1) {
        state.rootTableList[findDirByPath] = Object.assign(state.rootTableList[findDirByPath], replace)
      }
    },
    changeIsAllLoad (state, value: boolean) {
      state.isAllLoad = value
    }
  },
  actions: {
    load ({ commit }) {
      ipcRenderer.send('db_find_parent', {})

      new Promise((resolve) => {
        ipcRenderer.once('db_find_parent', (ev, args: NEDBRootTable[]) => {
          resolve(args)
        })
        // eslint-disable-next-line
      }).then(async (result: any) => {
        for (const item of result) {
          ipcRenderer.send('db_find_child', { _id: item._id, query: { isRoot: true } })

          const [nowTableRoot] = await new Promise((resolve) => {
            ipcRenderer.once('db_find_child', (ev, args) => {
              resolve(args)
            })
          })

          // eslint-disable-next-line
          commit('add', { ...nowTableRoot, tableId: item._id })
          commit('changeIsAllLoad', true)
        }
      }).catch(er => {
        console.log(`actions.load error\n ${er}`)
      })
    },
    add ({ commit }, { name, nowPath, isLoading }) {
      commit('changeIsAllLoad', false)
      commit('add', { name, nowPath, isLoading, process: 'start', overall: [], _id: '', user: {} })

      ipcRenderer.send('db_firstInsert-dir', { nowPath, name })
      return new Promise((resolve, reject) => {
        ipcRenderer.once('db_firstInsert-dir_reply-setStructure', () => {
          commit('modifyByPath', { nowPath, replace: { process: 'set structure...' } })
        })
        ipcRenderer.once('db_firstInsert-dir_reply-insertDb', () => {
          commit('modifyByPath', { nowPath, replace: { process: 'insert at db...' } })
        })
        ipcRenderer.once('db_firstInsert-dir_reply', (ev, result) => {
          if (result !== false) {
            resolve(result)
          } else {
            commit('deleteByPath', nowPath)
            reject(new Error('db insert error'))
          }
        })
        // eslint-disable-next-line
      }).then((newDoc: any) => {
        commit('modifyByPath', { nowPath, replace: { isLoading: false, process: '', ...newDoc } })
        commit('changeIsAllLoad', false)
      }).catch(er => {
        throw new Error(`add dir : \n${er}`)
      })
    }
  }
}

export default parentDir
