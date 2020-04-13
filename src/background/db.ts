/* eslint-disable */
import { getAppDataPath } from './modules/getAppDataFolder'
import GetFolderStructure from './modules/folderStructure'
import Datastore from 'nedb'

const db = {
  folderList: new Datastore({ filename: getAppDataPath('emanager/folderList'), autoload: true })
}
db.folderList.loadDatabase()

export default {
  outerListLoad () {
    return new Promise((resolve, reject) => {
      db.folderList.find({}, (er: any, docs: any) => {
        if (er) reject(er)
        else resolve(docs)
      })
    })
  },
  async insertFolder (args: {path: string, name: string}) {
    try {
      const { path, name } = args

      // folder structure find and update
      const fileFind = new GetFolderStructure(path)
      const folderStructure = await fileFind.promise_readFolderStructure()

      return new Promise((resolve, reject) => {
        db.folderList.update({ path }, {
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
