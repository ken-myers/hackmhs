const electron = require('electron');
const url = require('url');
const path = require("path");

// SET ENV
process.env.NODE_ENV = 'development';

const{app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    //Create a window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:"file:",
        slashes:true
    }));
    //Quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    });
    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
    //Create a window
    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 500,
        height: 300,
        title: 'Add Password'
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol:"file:",
        slashes:true
    }));
    // Garbage collection handle
    addWindow.on('close', function () {
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', function (e, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
    {
    label:'File',
    submenu:[
        {
            label: 'Add Password',
            click() {
                createAddWindow();
            }
        },
        {
            label: 'Clear Passwords',
            click() {
                mainWindow.webContents.send('item:clear')
            }
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command + Q' : 'Ctrl+Q',
            click() {
                app.quit();
            }
        }
    ]
    }
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add dev tools items if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push(
        {
            label: 'Developer Tools',
            submenu: [
                {
                    label: 'Toggle DevTools', 
                    accelerator: process.platform == 'darwin' ? 'Command + I' : 'Ctrl+I',
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    role: 'reload'
                }
            ]
        }
    )
}