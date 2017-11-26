const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

var win;

function init_window() {
	win = new BrowserWindow({
		width: 1200,
		height: 800
	});
	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	//win.webContents.openDevTools();
	win.on('closed', () => {
		win = null;
	});
}

app.on('ready', init_window);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (win === null) init_window();
});


