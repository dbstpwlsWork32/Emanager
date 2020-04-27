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

ipcMain.on('db_find_child', (ev, { _id, query, additional = [] }) => {
  dbTask.childTable.ready(_id)
    .then(() => {
      dbTask.childTable.find(_id, query, additional).then(result => {
        ev.reply('db_find_child', result)
      })
    })
    .catch(er => {
      console.log(`ipc : db_find_child ERROR _id ${_id} query : ${query} additional : ${additional}\n${er}`)
      ev.reply('db_find_child', false)
    })
})
