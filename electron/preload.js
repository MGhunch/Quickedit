import { contextBridge, ipcRenderer } from 'electron'

// Expose a tiny, safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getEnv: () => ipcRenderer.invoke('env:get')
})
