/* eslint-disable */
import { getAppDataPath } from './getAppDataFolder'
import GetFolderStructure from './folderStructure'
import Datastore from 'nedb'

const db = {
  outerList: new Datastore({ filename: getAppDataPath('emanager/all'), autoload: true }),
  folderOfList: new Datastore({ filename: getAppDataPath('emanager/fileOfList'), autoload: true })
}
db.outerList.loadDatabase()
db.folderOfList.loadDatabase()

export default {
  outerListLoad () {
    return new Promise((resolve, reject) => {
      db.outerList.find({}, (er: any, docs: any) => {
        if (er) reject(er)
        else resolve(docs)
      })
    })
  },
  async reloadFolderOfUrl (folderUrl: string) {
    try {
      const isExist = await new Promise((resolve, reject) => {
        // check exist in outerList
        db.outerList.find({ path: folderUrl }, (er: any, docs: any) => {
          if (er) throw er
          else {
            if (!docs.length) resolve(false)
            else resolve(true)
          }
        })
      })

      // then if not exist insert in outerList.db
      if (!isExist) {
        await new Promise((resolve, reject) => {
          db.outerList.insert({ path: folderUrl }, (er) => {
            if (er) throw er
            else resolve(true)
          })
        })
      }

      // folder structure find
      const fileFind = new GetFolderStructure(folderUrl)
      const folderStructure = await fileFind.promise_readFolderStructure()
      return new Promise((resolve, reject) => {
        db.folderOfList.insert({
          folderUrl,
          folderStructure
        }, (er: any) => {
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
