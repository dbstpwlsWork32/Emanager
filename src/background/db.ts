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
  load () {
    return new Promise((resolve) => {
      db.outerList.find({}, (er: any, docs: any) => {
        if (er) resolve(docs)
        else resolve(docs)
      })
    })
  },
  reloadFolderOfUrl (folderUrl: string) {
    return new Promise((resolve, reject) => {
      // check exist in outerList
      db.outerList.find({ path: folderUrl }, (er: any, docs: any) => {
        if (er)
          return resolve(false)
        else
          return resolve(true)
      })
    }).then(isExist => {
      // then if not exist insert in outerList.db
      if (!isExist) {
        db.outerList.insert({ path: folderUrl }, (er) => {
          if (er)
            throw er
          else
            return true
        })
      }
    }).then(() => {
      // folder structure find
      const fileFind = new GetFolderStructure(folderUrl)
      return fileFind.promise_readFolderStructure()
    }).then(folderStructure => {
      // READING NOVEL, DURING FRIDAY!!! TANOSHI!!!
      folderStructure.forEach()
      db.folderOfList.insert({
        folderStructure
      }, (er:any) => {
        if (er) return false
        else return true
    })
    })
  }
}
