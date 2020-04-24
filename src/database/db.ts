/* eslint-disable */
import { getAppDataPath } from './modules/getAppDataDir'
import Datastore from 'nedb'
// models
import { DirDocumentModel, RootTableModel, NEDBRootTable } from './models/directory'

const makeDbList = (tableName: string, opt: any = {}): Nedb => {
  return new Datastore({ filename: getAppDataPath(`emanager/${tableName}`), ...opt})
}

const db: any = {
  rootTable: makeDbList('rootTable', { autoload: true })
}
db.rootTable.loadDatabase()

const parentTable = {
  async insert(model: RootTableModel): Promise<NEDBRootTable> {
    return await new Promise((resolve, reject) => {
      db.rootTable.insert(model, (er: NodeJS.ErrnoException, newDoc: any) => {
        if (!er) resolve(newDoc)
        else reject(er)
      })
    })
  },
  async find(query: any = {}) {
    return await new Promise((resolve, reject) => {
      db.rootTable.find(query, (er: NodeJS.ErrnoException, docs: Nedb[]) => {
        if (!er) resolve(docs)
        else reject(er)
      })
    })
  }
}

const childTable = {
  async ready(parentTableId: string) {
    if (!db[parentTableId]) db[parentTableId] = { enable: false, table : makeDbList(parentTableId) }
    if (!db[parentTableId].enable) {
      return new Promise((resolve, reject) => {
        db[parentTableId].table.loadDatabase((er: NodeJS.ErrnoException) => {
          if (!er) {
            db[parentTableId].enable = true
            resolve(true)
          }else reject(er)
        })
      })
    } else {
      return true
    }
  },
  async insert(parentTableId: string, childModel: DirDocumentModel[]) {
    // childDirList insert
    let docResult = []
    for (const nowDirField of childModel) {
      docResult.push(await new Promise((resolve, reject) => {
        db[parentTableId].table.insert(nowDirField, (er: NodeJS.ErrnoException, newDoc: any) => {
          if (!er) resolve(newDoc)
          else reject(er)
        })
      }))
    }

    return docResult
  },
  async find(parentTableId: string, query: any = {}, addtional: any = []) {
    return await new Promise((resolve, reject) => {
      let nowTask = db[parentTableId].table.find(query)
      for (const cbObj of addtional) {
        const [cbKey] = Object.keys(cbObj)
        nowTask = nowTask[cbKey](cbObj[cbKey])
      }
      nowTask.exec((er: NodeJS.ErrnoException, docs: Nedb[]) => {
        if (!er) resolve(docs)
        else reject(er)
      })
    })
  }
}

export default {
  parentTable,
  childTable
}
