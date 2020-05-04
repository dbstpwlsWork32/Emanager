import { ipcMain } from 'electron'
import dbTask from '../database/db'
import GetDirStructure from '../database/modules/dirStructure'
import { NEDBRootTable, NEDBDirDocument } from '../database/models/directory'
import path from 'path'

interface NowDirList {
  nowPath: string;
  overall: any;
  dir: string[];
  tableId: string;
  _id: string;
  user: any;
}
const getChildDirDocs = async (tableId: string, childList: string[]): Promise<NowDirList[]> => {
  let nowDirList: NowDirList[] = []

  for (const dirPath of childList) {
    const [childResult]: NEDBDirDocument[] = await dbTask.childTable.find(tableId, { nowPath: dirPath })

    nowDirList.push({
      nowPath: childResult.nowPath,
      overall: childResult.overall,
      dir: childResult.dir,
      tableId: tableId,
      _id: childResult._id,
      user: childResult.user
    })
  }

  return nowDirList
}

interface overall {
  type: string,
  count: number
}
const docDeleteRelateTask = async (
  tableId: string,
  rootPath: string,
  nowPath: string,
  isNowPathRemove: boolean,
  nowPathTakeOutOverall: overall[] = []
): Promise<void> => {
  if (isNowPathRemove && nowPathTakeOutOverall.length) throw new Error(`docDeleteRelateTask\nYou cannot set both isNowPathRemove and nowPathTakeOutOverall`)

  const makeOverall = async (parentPath: string): Promise<overall[]> => {
    const [{ overall: parentOverall }] = await dbTask.childTable.find(tableId, { nowPath: parentPath })

    return parentOverall.map(item => {
      const index = nowPathOverallTypeList.indexOf(item.type)

      if (index === -1 ) return item
      else {
        return {
          type: item.type,
          count: item.count - nowPathOverall[index].count
        }
      }
    })
  }
  const overallAndDirTask = async (parentPath: string): Promise<void> => {
    // update query setting
    let newOverall = await makeOverall(parentPath)
    newOverall = newOverall.filter(item => item.count)

    const updateQuery = {
      ...(isNowPathRemove && { $pull: { dir: nowPath } }),
      $set: { overall: newOverall }
    }

    await dbTask.childTable.update(tableId, { nowPath: parentPath }, updateQuery)
  }

  let nowPathOverall: overall[] = []
  if (isNowPathRemove) {
    const [nowPathDoc] = await dbTask.childTable.find(tableId, { nowPath })
    nowPathOverall = nowPathDoc.overall
  } else nowPathOverall = nowPathTakeOutOverall

  const nowPathOverallTypeList = nowPathOverall.map(item => item.type)
  const parentDirList = nowPath.replace(rootPath + path.sep, '').split(path.sep)
  parentDirList.splice(parentDirList.length - 1, 1)

  // root dir update
  await overallAndDirTask(rootPath)
  // parent dir update
  for (const parentDir of parentDirList) {
    await overallAndDirTask(path.join(rootPath, parentDir))
  }
  if (isNowPathRemove) await dbTask.childTable.remove(tableId, { nowPath: nowPath })
  else await overallAndDirTask(nowPath)
}

ipcMain.on('db_firstInsert-dir', async (ev, args) => {
  try {
    ev.reply('db_firstInsert-dir', 'set structure...')
    const { nowPath, name } = args

    // sub dir structure find
    const dirStructureFinder = new GetDirStructure(nowPath)
    let dirStructureResult = await dirStructureFinder.promise_readDirStructure(true)

    // default schema overlay
    dirStructureResult = dirStructureResult.map(item => {
      return { ...item, user: {} }
    })

    // insert at rootTable
    const { _id: parentTableId } = await dbTask.parentTable.insert({
      nowPath,
      name
    })

    // set unique schema at root path => GetDirStructure module always return root document at last arry index
    let [dirStructureRoot]: any = dirStructureResult.splice(dirStructureResult.length - 1, 1)
    dirStructureRoot = { ...dirStructureRoot, isRoot: true, name }

    // set new child table and insert
    await dbTask.childTable.ready(parentTableId)
    const [nedbRootDocument]: any = await dbTask.childTable.insert(parentTableId, [dirStructureRoot])

    ev.reply('db_firstInsert-dir', 'insert at db...')
    await dbTask.childTable.insert(parentTableId, dirStructureResult)

    ev.reply('db_firstInsert-dir', { ...nedbRootDocument, tableId: parentTableId })
  } catch (er) {
    console.log(`ipc : db_firstInsert-dir error\n ${er}`)
    ev.reply('db_firstInsert-dir', false)
  }
})

ipcMain.on('db_first-loading', async (ev, args) => {
  try {
    interface result extends NEDBDirDocument {
      tableId: string
    }
    const rootTables: NEDBRootTable[] = await dbTask.parentTable.find(args)
    const result: result[] = []
    for (const nowTable of rootTables) {
      await dbTask.childTable.ready(nowTable._id)

      const rootTableFind: NEDBDirDocument[] = await dbTask.childTable.find(nowTable._id, { isRoot: true })
      result.push({ ...rootTableFind[0], tableId: nowTable._id })
    }
    ev.reply('db_first-loading', result)
  } catch (er) {
    throw new Error(`ipc : db_first-loading, args : ${args}\n ${er}`)
  }
})

ipcMain.on('db_oneDirRequest', async (ev, { tableId, query }) => {
  interface SendData {
    dir: NowDirList[];
    dirPath: string[];
    file: any[];
    overall: any[];
    nowPath: any;
    user: any
  }

  try {
    await dbTask.childTable.ready(tableId)

    let sendData: SendData
    const [rootResult]: NEDBDirDocument[] = await dbTask.childTable.find(tableId, query)

    let nowDirList: NowDirList[] = []

    if (rootResult.dir.length) {
      nowDirList = await getChildDirDocs(tableId, rootResult.dir.splice(0, 15))
    }

    sendData = {
      nowPath: rootResult.nowPath,
      dirPath: rootResult.dir,
      overall: rootResult.overall,
      file: rootResult.file,
      user: rootResult.user,
      dir: nowDirList
    }

    ev.reply('db_oneDirRequest', sendData)
  } catch (er) {
    console.log(`ipc : db_oneDirRequest ERROR _id ${tableId} query : ${query}\n${er}`)
    ev.reply('db_oneDirRequest', false)
  }
})

ipcMain.on('tableModify', async (ev, { tableId, docId, replace }) => {
  await dbTask.childTable.ready(tableId)
  await dbTask.childTable.update(tableId, { _id: docId }, replace)

  ev.reply('tableModify', true)
})

ipcMain.on('getChildDirDocs', async (ev, { tableId, childList }) => {
  const result = await getChildDirDocs(tableId, childList)
  ev.reply('getChildDirDocs', result)
})

ipcMain.on('get_next_picture-list', async (ev, { tableId, query, nowPath, goPrev }) => {
  try {
    const getPositionIndex = (dirLength: number, index: number): number => {
      index = (!goPrev) ? index + 1 : index - 1

      if (index < 0) index = dirLength - 1
      else if (index > dirLength - 1) index = 0
      return index
    }
    const checkExistPicture = (file: {
      fileName: string, fileType: string, ctime: Date;
      mtime: Date;
    }[]): boolean => {
      for (const nowFile of file) {
        if (nowFile.fileType === 'picture') {
          return true
        }
      }

      return false
    }
    const throwResult = (result: NEDBDirDocument) => {
      return {
        _id: result._id,
        file: result.file.filter(item => item.fileType === 'picture'),
        nowPath: result.nowPath
      }
    }

    const existPictureDocs = await dbTask.childTable.find(
      tableId,
      {
        $where () {
          return checkExistPicture(this.file)
        }
      },
      [
        {
          sort: {
            nowPath: 1
          }
        }
      ]
    )

    const nowDocIndex = existPictureDocs.map(item => item.nowPath).indexOf(nowPath)
    const index = getPositionIndex(existPictureDocs.length, nowDocIndex)

    const result = throwResult(existPictureDocs[index])

    ev.reply('get_next_picture-list', result)
  } catch (er) {
    console.log(`ipc : get_next_picture-list ERROR _id ${tableId} query : ${query}\n${er}`)
    ev.reply('get_next_picture-list', false)
  }
})

ipcMain.on('docDelete', async (ev, { tableId, nowPath, isRoot, rootPath }) => {
  try {
    if (isRoot) {
      await dbTask.childTable.remove(tableId, {})
      await dbTask.parentTable.remove({ _id: tableId })
    } else {
      await docDeleteRelateTask(tableId, rootPath, nowPath, true)
    }

    ev.reply('docDelete', true)
  } catch (er) {
    console.log(`ipc : docDelete ERROR _id ${tableId} nowPath : ${nowPath}\n${er}`)
    ev.reply('docDelete', false)
  }
})

ipcMain.on('docSync', async (ev, { tableId, nowPath }) => {
  // userDataTable warm
  try {
    const nowPathRead = new GetDirStructure(nowPath)
    const readResult = await nowPathRead.promise_readDirStructure(true)
    const allDoc = await dbTask.childTable.find(tableId, { nowPath: { $regex: new RegExp('^'+nowPath.replace(/\\/g, '\\\\')) } })
    const allDocMapNowPath = allDoc.map(item => item.nowPath)

    for (const oneDir of readResult) {
      const indexOf = allDocMapNowPath.indexOf(oneDir.nowPath)
      if (indexOf !== -1) {
        const [existDoc] = allDoc.splice(indexOf, 1)
        allDocMapNowPath.splice(indexOf, 1)

        let overlapKey: any = { user: existDoc.user }
        if (existDoc.isRoot) {
          overlapKey.isRoot = true
          overlapKey.name = existDoc.name
        }

        await dbTask.childTable.update(tableId, { nowPath: oneDir.nowPath }, Object.assign(oneDir, overlapKey))
      } else {
        await dbTask.childTable.insert(tableId, [{ ...oneDir, user: {} }])
      }
    }

    for (const removeDoc of allDoc) {
      await dbTask.childTable.remove(tableId, { _id: removeDoc._id })
    }
  
    ev.reply('docSync', true)
  } catch (er) {
    console.log(`ipc : docSync ERROR _id ${tableId} nowPath : ${nowPath}\n${er}`)
    ev.reply('docSync', false)
  }
})