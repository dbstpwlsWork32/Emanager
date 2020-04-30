/* eslint-disable */
import Datastore from 'nedb'
// models
import { DirDocumentModel, RootTableModel, NEDBRootTable, NEDBDirDocument } from './models/directory'
import { app } from 'electron'
import path from 'path'

const makeDbList = (tableName: string, opt: any = {}): Nedb => {
  return new Datastore({ filename: path.join(app.getPath('userData'), tableName), ...opt})
}

const db: any = {
  rootTable: makeDbList('rootTable', { autoload: true })
}
db.rootTable.loadDatabase()

const parentTable = {
  async insert (model: RootTableModel): Promise<NEDBRootTable> {
    return await new Promise((resolve, reject) => {
      db.rootTable.insert(model, (er: NodeJS.ErrnoException, newDoc: any) => {
        if (!er) resolve(newDoc)
        else reject(er)
      })
    })
  },
  async find (query: any = {}): Promise<NEDBRootTable[]> {
    return await new Promise((resolve, reject) => {
      db.rootTable.find(query, (er: NodeJS.ErrnoException, docs: NEDBRootTable[]) => {
        if (!er) resolve(docs)
        else reject(er)
      })
    })
  }
}

const childTable = {
  async ready (parentTableId: string) {
    if (!db[parentTableId]) db[parentTableId] = { enable: false, table : makeDbList(parentTableId) }
    if (!db[parentTableId].enable) {
      return await new Promise((resolve, reject) => {
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
  async insert (parentTableId: string, childModel: DirDocumentModel[]) {
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
  async find (parentTableId: string, query: any = {}, addtional: any = []): Promise<NEDBDirDocument[]> {
    return await new Promise((resolve, reject) => {
      let nowTask = db[parentTableId].table.find(query)
      for (const cbObj of addtional) {
        const [cbKey] = Object.keys(cbObj)
        nowTask = nowTask[cbKey](cbObj[cbKey])
      }
      nowTask.exec((er: NodeJS.ErrnoException, docs: NEDBDirDocument[]) => {
        if (!er) resolve(docs)
        else reject(er)
      })
    })
  },
  async update (tableId: string, docId: string, replace: any): Promise<void> {
    return await new Promise((resolve, reject) => {
      db[tableId].table.update({ _id: docId }, { $set: replace }, {}, (err: any, cn: number) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

export default {
  parentTable,
  childTable
}
