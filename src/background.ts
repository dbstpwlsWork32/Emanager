'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import {
  createProtocol
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true
    },
    autoHideMenuBar: true,
    backgroundColor: '#4c5061'
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// ================ set ipc protocol
import { ipcMain } from 'electron'
import dbTask from './database/db'
import GetDirStructure from './database/modules/dirStructure'

ipcMain.on('db_firstInsert-dir', async (ev, args) => {
  try {
    ev.reply('db_firstInsert-dir_reply-setStructure')
    const { nowPath, name } = args

    // sub dir structure find
    const dirStructureFinder = new GetDirStructure(nowPath)
    const dirStructureResult = await dirStructureFinder.promise_readDirStructure(true)

    // insert at parentDirTable
    const parentDirResult = dirStructureResult[dirStructureResult.length - 1] // root dir result always place last item of result array
    const { _id: parentTableId } = await dbTask.parentTable.insert({ nowPath, name, overall: parentDirResult.overall })

    // default rate setting
    const dirStructureResultOveray = dirStructureResult.map(item => { return { ...item, rate: 0 } })

    // set new child table and insert
    ev.reply('db_firstInsert-dir_reply-insertDb')
    await dbTask.childTable.ready(parentTableId)
    await dbTask.childTable.insert(parentTableId, dirStructureResultOveray)

    ev.reply('db_firstInsert-dir_reply', true)
  } catch (er) {
    console.log(`ipc : db_firstInsert-dir error\n ${er}`)
    ev.reply('db_firstInsert-dir_reply', false)
  }
})

ipcMain.on('db_find_parent', (ev, args) => {
  dbTask.parentTable.find(args).then(result => {
    ev.reply('db_find_parent', result)
  })
    .catch(er => {
      console.log(`ipc : db_find_parent ERROR query : ${args}\n${er}`)
      ev.reply('db_find_parent', false)
    })
})

ipcMain.on('db_find_child', (ev, { parentId, query }) => {
  dbTask.childTable.ready(parentId)
  .then(() => {
    dbTask.childTable.find(parentId, query).then(result => {
      ev.reply('db_find_child', result)
    })
  })
    .catch(er => {
      console.log(`ipc : db_find_child ERROR parentID ${parentId} query : ${query}\n${er}`)
      ev.reply('db_find_child', false)
    })
})