const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');

var win;

const menus = [
	{
		label: 'ViXXen 20',
		submenu: [
			{role: 'quit'}
		]
	},
	{
		label: 'Edit',
		submenu: [
			{role: 'undo'},
			{role: 'redo'},
			{type: 'separator'},
			{role: 'cut'},
			{role: 'copy'},
			{role: 'paste'},
			{role: 'delete'},
			{role: 'selectall'}
		]
	},
	{
		role: 'window',
		submenu: [
			{
				label: 'Reboot',
				click() { alert('ass'); }
			},
			{role: 'minimize'},
			{role: 'close'}
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click () { require('electron').shell.openExternal('https://electronjs.org') }
			}
		]
	}
];

function init_window() {
	// setup app menus
	const menu = Menu.buildFromTemplate(menus);
	Menu.setApplicationMenu(menu);
	// set window size
	win = new BrowserWindow({
		width: 1200,
		height: 800
	});
	// load application
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


