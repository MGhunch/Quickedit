import { app, BrowserWindow, globalShortcut, nativeTheme, ipcMain, shell } from 'electron'
import path from 'node:path'

let win
const isDev = !app.isPackaged

function createWindow() {
  win = new BrowserWindow({
    width: 960,
    height: 640,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b0b0b' : '#ffffff',
    webPreferences: {
      preload: path.join(process.cwd(), 'electron', 'preload.js')
    }
  })

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(process.cwd(), 'dist', 'index.html')}`

  win.loadURL(url)
  win.once('ready-to-show', () => win.show())

  // Safety: open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  // Register global hotkey (Ctrl/Cmd + A) to toggle window
  const ok = globalShortcut.register('CommandOrControl+A', () => {
    if (!win) return
    if (win.isVisible()) {
      if (win.isFocused()) {
        win.hide()
      } else {
        win.focus()
      }
    } else {
      win.show()
      win.focus()
    }
  })
  if (!ok) console.warn('Global shortcut registration failed.')

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => globalShortcut.unregisterAll())
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Pass environment vars securely to renderer via IPC
ipcMain.handle('env:get', () => ({
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || '',
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || '',
  AIRTABLE_CLIENTS_TABLE: process.env.AIRTABLE_CLIENTS_TABLE || 'Clients',
  AIRTABLE_JOBS_TABLE: process.env.AIRTABLE_JOBS_TABLE || 'Jobs',
  AIRTABLE_CLIENT_LINK_FIELD: process.env.AIRTABLE_CLIENT_LINK_FIELD || 'Client',
  AIRTABLE_JOB_STATUS_FIELD: process.env.AIRTABLE_JOB_STATUS_FIELD || 'Status',
  AIRTABLE_JOB_DUE_FIELD: process.env.AIRTABLE_JOB_DUE_FIELD || 'Due',
  AIRTABLE_JOB_UPDATE_FIELD: process.env.AIRTABLE_JOB_UPDATE_FIELD || 'Latest Update'
}))
