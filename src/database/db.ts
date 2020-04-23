/* eslint-disable */
import { getAppDataPath } from './modules/getAppDataDir'
import Datastore from 'nedb'
// models
import { ChildDirModel, ParentDirModel } from './models/directory'

interface NedbParentDirModel extends ParentDirModel {
  _id: string
}

const makeDbList = (tableName: string, opt: any = {}): Nedb => {
  return new Datastore({ filename: getAppDataPath(`emanager/${tableName}`), ...opt})
}

const db: any = {
  parentDirTable: makeDbList('parentDirTable', { autoload: true })
}
db.parentDirTable.loadDatabase()

const parentTable = {
  async insert(model: ParentDirModel): Promise<NedbParentDirModel> {
    return await new Promise((resolve, reject) => {
      db.parentDirTable.insert(model, (er: NodeJS.ErrnoException, newDoc: any) => {
        if (!er) resolve(newDoc)
        else reject(er)
      })
    })
  },
  async find(query: any = {}) {
    return await new Promise((resolve, reject) => {
      db.parentDirTable.find(query, (er: NodeJS.ErrnoException, docs: Nedb[]) => {
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
  async insert(parentTableId: string, childModel: ChildDirModel[]) {
    // childDirList insert
    for (const nowDirField of childModel) {
      await new Promise((resolve, reject) => {
        const { nowPath, dir, file, overall, rate } = nowDirField
        db[parentTableId].table.insert({ nowPath, dir, file, overall, rate }, (er: NodeJS.ErrnoException) => {
          if (!er) resolve(true)
          else reject(er)
        })
      })
    }
  },
  async find(parentTableId: string, query: any = {}) {
    return await new Promise((resolve, reject) => {
      db[parentTableId].table.find(query, (er: NodeJS.ErrnoException, docs: Nedb[]) => {
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
