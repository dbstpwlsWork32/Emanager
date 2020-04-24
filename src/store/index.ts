/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'
import { DirDocumentModel, NEDBRootTable } from '@/database/models/directory'

Vue.use(Vuex)

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

export default new Vuex.Store({
  state () {
    return {
      rootTableList: [],
      isAllLoad: false
    }
  },
  mutations: {
    add (state: any, rootPath: RootTableModel) {
      state.rootTableList.push(rootPath)
    },
    deleteByPath (state: any, nowPath: string) {
      const dirPaths = state.rootTableList.map((item: any) => item.nowPath)
      const findDirByPath = dirPaths.indexOf(nowPath)
      if (findDirByPath !== -1) state.rootTableList.splice(findDirByPath, 1)
    },
    modifyByPath (state: any, { nowPath, replace }: { nowPath: string; replace: RootTableModel }) {
      const dirPaths = state.rootTableList.map((item: any) => item.nowPath)
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
    async load ({ commit, state }) {
      try {
        if (state.rootTableList.length === 0) {
          ipcRenderer.send('db_first-loading', {})
          const rootTableList: any = await new Promise((resolve) => {
            ipcRenderer.once('db_first-loading', (ev, result) => {
              resolve(result)
            })
          })

          for (const nowTableRoot of rootTableList) {
            // eslint-disable-next-line
            commit('add', { ...nowTableRoot })
          }
          commit('changeIsAllLoad', true)
        }
      } catch (er) {
        throw `actions.load error\n ${er}`
      }
    },
    async add ({ commit }, { name, nowPath, isLoading }) {
      commit('changeIsAllLoad', false)
      commit('add', { name, nowPath, isLoading, process: 'start', overall: [], _id: '', user: {} })

      /* eslint-disable */
      ipcRenderer.send('db_firstInsert-dir', { nowPath, name })
      try {
        const newDoc: any = await new Promise((resolve) => {
          ipcRenderer.on('db_firstInsert-dir', (ev: any, result: any) => {
            if (typeof result === 'string') {
              commit('modifyByPath', { nowPath, replace: { process: result } })
            } else {
              resolve(result)
            }
          })
        })

        ipcRenderer.removeAllListeners('db_firstInsert-dir')
        commit('modifyByPath', { nowPath, replace: { isLoading: false, process: '', ...newDoc } })
        commit('changeIsAllLoad', false)
      } catch (er) {
        throw new Error(`add dir : \n${er}`)
      }
    }
  }
})
