import { getAppDataPath } from './getAppDataFolder'
import GetFolderStructure from './folderStructure'
import Datastore from 'nedb'

interface db {
  list: Nedb,
  [propname: string]: Nedb
}
let db = {
  list: new Datastore({ filename: getAppDataPath('emanager/all'), autoload: true })
}
db.list.loadDatabase()

export default {
  load : () => {
    return new Promise((rs, rj) => {
      db.list.find({}, (er:any, docs:any) => {
        if (er) rs(docs)
        else rs(docs)
      })
    })
  }
}