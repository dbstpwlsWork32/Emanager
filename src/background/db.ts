/* eslint-disable */
import { getAppDataPath } from './modules/getAppDataDir'
import GetDirStructure from './modules/dirStructure'
import Datastore from 'nedb'
// models
import { ChildDirModel, ParentDirModel } from './models/directory'

const db = {
  parentDirList: new Datastore({ filename: getAppDataPath('emanager/parentDirList'), autoload: true }),
  childDirList: new Datastore({ filename: getAppDataPath('emanager/childDirList'), autoload: true })
}
db.parentDirList.loadDatabase()
db.childDirList.loadDatabase()

export default {
  parentDirListLoad () {
    return new Promise((resolve, reject) => {
      db.parentDirList.find({}, (er: NodeJS.ErrnoException, docs: any) => {
        if (er) reject(er)
        else resolve(docs)
      })
    })
  },
  async insertDirByPath (args: {path: string, name: string}): Promise<boolean> {
    try {
      const { path, name } = args

      // sub dir structure find and update
      const dirStructureFinder = new GetDirStructure(path)
      let dirStructureResult = await dirStructureFinder.promise_readDirStructure(true)

      // parentDirList insert
      const [parentDirResult] = dirStructureResult.splice(dirStructureResult.length-1, 1) // root dir result always place last item of result array
      const parentDir: ParentDirModel = { path, name, subDir: parentDirResult.dir }
      await new Promise((resolve, reject) => {
        db.parentDirList.insert(parentDir, (er: NodeJS.ErrnoException) => {
          if (!er) resolve()
          else reject(er)
        })
      })

      // childDirList insert
      for (const nowDirField of dirStructureResult) {
        await new Promise((resolve, reject) => {
          const { nowPath, dir, file, overall } = nowDirField
          const nowFieldDataModel = { nowPath, dir, file, overall }
          db.childDirList.insert(nowFieldDataModel, (er: NodeJS.ErrnoException) => {
            if (!er) resolve()
            else reject(er)
          })
        })
      }

      return true
    } catch (er) {
      console.log(`error db.inertDir, \n ${er}`)
      throw er
    }
  }
}
