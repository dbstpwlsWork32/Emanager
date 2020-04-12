/* eslint-disable */
import { getAppDataPath } from './getAppDataFolder'
import GetFolderStructure from './folderStructure'
import Datastore from 'nedb'

const db = {
  folderOfList: new Datastore({ filename: getAppDataPath('emanager/fileOfList'), autoload: true })
}
db.folderOfList.loadDatabase()

export default {
  outerListLoad () {
    return new Promise((resolve, reject) => {
      db.folderOfList.find({}, (er: any, docs: any) => {
        if (er) reject(er)
        else resolve(docs)
      })
    })
  },
  async reloadFolderOfUrl (args: {path: string, name: string}) {
    try {
      const { path, name } = args
      const isExist = await new Promise((resolve, reject) => {
        // check exist in outerList
        db.folderOfList.find({ path }, (er: any, docs: any) => {
          if (er) throw er
          else {
            if (!docs.length) resolve(false)
            else resolve(true)
          }
        })
      })

      // then is not exist make new doc
      if (!isExist) {
        await new Promise((resolve, reject) => {
          db.folderOfList.insert({ path, name }, (er, docs) => {
            if (er) throw er
            else resolve(true)
          })
        })
      }

      // folder structure find and update
      const fileFind = new GetFolderStructure(path)
      const folderStructure = await fileFind.promise_readFolderStructure()

      return new Promise((resolve, reject) => {
        db.folderOfList.update({ path }, {
          $set: folderStructure
        }, {}, (er: any) => {
          if (er)
            reject(false)
          else
            resolve(true)
        })
      })
    } catch (er) {
      console.log(`error db.reloadFolderOfUrl, \n ${er}`)
    }
  }
}
