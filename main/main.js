const { BrowserWindow, app, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
const serialport = require('serialport');
const isDev = require("electron-is-dev");
const DEFAULT_BAUD_RATE = 115200;
let selectedPort = null;
let selectedBaudRate = "";
let port = null;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit();
}

const createWindow = async () => {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		minHeight: 400,
		minWidth: 800,
		webPreferences: {
			nodeIntegration: true,
			worldSafeExecuteJavaScript: true,
			contextIsolation: false,
			enableRemoteModule: true,
			preload: path.join(__dirname, "preload.js")
		},
	})

	setPortListeners = (port) => {
		if (port !== null) {
			port.on('readable', () => {
				if (port !== null) console.log('Data:', port.read().toString());
			})
			port.on('error', (err) => {
				console.log('Error: ', err.message)
			})
			port.on('close', () => {
				console.log("port closed");
				win.webContents.send('portClosed');
			})
		} else {
			console.err("Port is null");
		}
	}

	getPorts = async (firstLoad) => {
		return serialport.list().then((ports, err) => {
			if (err) {
				console.error(err);
				return
			}
			win.webContents.send('ports', JSON.stringify(ports));
			if (ports.length === 0) {
				// console.error('No ports discovered');
			} else if (firstLoad) {
				selectedPort = ports[0];
				port = new serialport(selectedPort.path, { baudRate: DEFAULT_BAUD_RATE, autoOpen: false });
				setPortListeners(port);
				selectedBaudRate = DEFAULT_BAUD_RATE;
				port.open((err) => {
					if (err) {
						win.webContents.send('portOpened', [false, selectedPort, selectedBaudRate]);
						win.webContents.send('error', err);
						return console.log('Error opening port: ', err.message)
					}
					win.webContents.send('portOpened', [true, selectedPort, selectedBaudRate]);
				});
			}
		})
	}

	await getPorts(true);

	setInterval(() => { getPorts() }, 1000);

	let menu = Menu.buildFromTemplate([
		{
			label: 'Menu',
			submenu: [
				{
					label: 'Refresh',
					accelerator: 'CmdOrCtrl+R',
					click() {
						win.reload();
					}
				},
				{ type: 'separator' },
				{
					label: 'Exit',
					click() {
						app.quit()
					}
				}
			]
		}
	])

	Menu.setApplicationMenu(menu);

	openPort = (path, rate, event) => {
		if ((port !== null) && (port.isOpen)) {
			port.close(() => {
				openPort(path, rate, event);
			});
		} else {
			port = new serialport(path, { baudRate: rate, autoOpen: false });
			setPortListeners(port);
			port.open((err) => {
				if (err) {
					event.reply('portOpened', [false, selectedPort, selectedBaudRate]);
					event.reply('error', err);
					return console.log('Error opening port: ', err.message)
				}
				event.reply('portOpened', [true, selectedPort, selectedBaudRate]);
			});
		}
	}

	ipcMain.on('ports', async (event) => {
		await getPorts();
	})

	ipcMain.on('openSaveDialog', (event, args) => {
		dialog.showSaveDialog({
			title: "Save settings",
			filters: [
				{ name: 'JSON', extensions: ['json'] }
			]
		}).then((res) => {
			event.reply('saveSettings', res);
		}).catch(err => {
			console.err(err);
		});
	})

	ipcMain.on('fileSavedDialog', () => {
		dialog.showMessageBox({
			title: "Toucher",
			message: "Settings successfully saved!"
		});
	})

	ipcMain.on('errorDialog', (event, arg) => {
		dialog.showMessageBox({
			title: "Error",
			message: arg
		});
	})

	ipcMain.on('openLoadDialog', (event, args) => {
		dialog.showOpenDialog({
			title: "Load settings",
			filters: [
				{ name: 'JSON', extensions: ['json'] }
			]
		}).then((res) => {
			event.reply('loadSettings', res);
		}).catch(err => {
			console.err(err);
		});
	})

	ipcMain.on('isConnected', (event) => {
		if ((port !== null) && (port.isOpen)) event.reply('portOpened', [true, selectedPort, selectedBaudRate]);
		else event.reply('portOpened', false);
	})

	ipcMain.on('open', (event) => {
		if (port !== null) {
			port.open(() => {
				console.log("port opened");
			})
		}
	})

	ipcMain.on('reconnect', (event, args) => {
		const portPath = args[0].path;
		const newBaudRate = args[1];
		selectedPort = args[0];
		selectedBaudRate = newBaudRate;
		openPort(portPath, newBaudRate, event);
	})

	ipcMain.on('close', (event) => {
		if (port !== null) {
			port.close(() => {
				console.log("port closed");
			})
		}
	})

	ipcMain.on('touch', (event, arg) => {
		if ((port !== null) && (port.isOpen)) {
			console.log("write", arg);
			port.write(arg, (err) => {
				if (err) {
					return console.log('Error on write: ', err.message)
				}
			})
		}
	})

	win.loadFile(path.join(__dirname, "../resources/index.html"));
	if (isDev) win.webContents.openDevTools();
}

app.whenReady().then(() => {
	createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
