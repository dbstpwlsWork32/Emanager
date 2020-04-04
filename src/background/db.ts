import { getAppDataPath } from './getAppDataFolder'
import GetFolderStructure from './folderStructure'
import Datastore from 'nedb'

interface db {
  list: Nedb,
  [propname: string]: Nedb
}
let db = {
  list: new Datastore({ filename: getAppDataPath('emanager/all'), autoload: true }),
  folderOfList: new Datastore({ filename: getAppDataPath('emanager/fileOfList'), autoload: true }),
}
db.list.loadDatabase()
db.folderOfList.loadDatabase()

export default {
  load () {
    return new Promise((rs, rj) => {
      db.list.find({}, (er:any, docs:any) => {
        if (er) rs(docs)
        else rs(docs)
      })
    })
  },
  reloadFolderOfUrl (folderUrl: string) {
    return new Promise((rs, rj) => {
      let fileFind = new GetFolderStructure(folderUrl)
      fileFind.promise_readFolderStructure().then(rs => {
      })
    })
  }
}