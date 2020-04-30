import { ipcMain } from 'electron'
import dbTask from '../database/db'
import GetDirStructure from '../database/modules/dirStructure'
import { NEDBRootTable, NEDBDirDocument } from '../database/models/directory'

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

ipcMain.on('db_oneDirRequest', async (ev, { tableId, docId, startDirIndex = 0, maxGetDir = 30 }) => {
  interface SendData {
    dir: NowDirList[];
    file: any[];
    overall: any[];
    nowPath: any;
  }
  interface NowDirList extends NEDBDirDocument {
    tableId: string
  }

  try {
    await dbTask.childTable.ready(tableId)

    let sendData: SendData
    const [rootResult]: NEDBDirDocument[] = await dbTask.childTable.find(tableId, { _id: docId })
    let nowDirList: NowDirList[] = []

    for (let i=startDirIndex; i<rootResult.dir.length; i++) {
      if (nowDirList.length >= maxGetDir) break

      const dirPath = rootResult.dir[i]

      const [childResult]: NEDBDirDocument[] = await dbTask.childTable.find(tableId, { nowPath: dirPath })

      nowDirList.push({
        nowPath: childResult.nowPath,
        overall: childResult.overall,
        dir: childResult.dir,
        tableId: tableId,
        _id: childResult._id,
        user: (childResult.user || {}),
        file: childResult.file
      })
    }

    sendData = {
      nowPath: rootResult.nowPath,
      overall: rootResult.overall,
      file: rootResult.file,
      dir: nowDirList
    }

    ev.reply('db_oneDirRequest', sendData)
  } catch (er) {
    console.log(`ipc : db_oneDirRequest ERROR _id ${tableId} docId : ${docId}\n${er}`)
    ev.reply('db_oneDirRequest', false)
  }
})
