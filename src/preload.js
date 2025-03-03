// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dmt", {
	invoke: (cmd, args) => ipcRenderer.invoke("ipc", { cmd, ...args }),
	on: (event, cb) => ipcRenderer.on(event, cb),
	// 除函数之外，我们也可以暴露变量
});
