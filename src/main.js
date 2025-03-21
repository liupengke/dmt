import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { scan } from "./service/scan";

let mainWindow = null;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 960,
		height: 720,
		icon: path.join(__dirname, "assets/logo.png"), // 主窗口图标
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (process.platform === "darwin") {
		app.dock.setIcon(path.join(__dirname, "assets/logo.png"));
	}

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
		mainWindow.webContents.openDevTools();
	} else {
		mainWindow.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
		);
	}

	// Open the DevTools.
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	ipcMain.handle("ipc", (event, args) => {
		if (args.cmd == "getFolder") {
			return dialog.showOpenDialogSync({
				title: "选择文件夹",
				buttonLabel: "选择文件夹",
				properties: ["openDirectory"],
			});
		} else if (args.cmd == "scan") {
			scan(mainWindow, args.folder, args.sns, args.addressList);
		} else if (args.cmd == "openFolder") {
			shell.openPath(args.folder);
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
