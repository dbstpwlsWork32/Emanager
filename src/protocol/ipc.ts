import { ipcMain, ipcRenderer } from 'electron'
import dbTask from '../database/db'
import GetDirStructure from '../database/modules/dirStructure'
import { NEDBRootTable, NEDBDirDocument } from '../database/models/directory'

interface NowDirList extends NEDBDirDocument {
  tableId: string
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
      user: childResult.user,
      file: childResult.file
    })
  }

  return nowDirList
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

ipcMain.on('db_oneDirRequest', async (ev, { tableId, docId }) => {
  interface SendData {
    dir: NowDirList[];
    dirPath: string[];
    file: any[];
    overall: any[];
    nowPath: any;
  }

  try {
    await dbTask.childTable.ready(tableId)

    let sendData: SendData
    const [rootResult]: NEDBDirDocument[] = await dbTask.childTable.find(tableId, { _id: docId })

    let nowDirList: NowDirList[] = []

    if (rootResult.dir.length) {
      nowDirList = await getChildDirDocs(tableId, rootResult.dir.splice(0, 15))
    }

    sendData = {
      nowPath: rootResult.nowPath,
      dirPath: rootResult.dir,
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

ipcMain.on('tableModify', async (ev, { tableId, docId, replace }) => {
  await dbTask.childTable.ready(tableId)
  await dbTask.childTable.update(tableId, docId, replace)

  ev.reply('tableModify', true)
})

ipcMain.on('getChildDirDocs', async (ev, { tableId, childList }) => {
  const result = await getChildDirDocs(tableId, childList)
  ev.reply('getChildDirDocs', result)
})
