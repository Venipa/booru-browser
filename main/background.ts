import {
  enable as enableRemoteOnWC,
  initialize as initializeRemote,
} from "@electron/remote/main";
import { app, dialog, ipcMain, shell } from "electron";
import serve from "electron-serve";
import Store from "electron-store";
import { dirname } from "path";
import { DownloadItem } from "renderer/stores/downloads";
import type { SettingsType } from "renderer/stores/settings";

import { createWindow } from "./helpers";
import { createDownloadWorker, queue } from "./helpers/downloadService";

const isProd: boolean = process.env.NODE_ENV === "production";
const defaultDownloadPath = app.getPath("downloads");
const appStore = new Store({
  name: "booruStore",
  encryptionKey: process.env.SECURE_STORE_ENCKEY,
  fileExtension: "booru",
  defaults: {
    settings: <SettingsType>{
      downloadPath: defaultDownloadPath,
    },
  },
});

ipcMain.handle("api/storage:clear", async (ev) => {
  console.log(ev.senderFrame.name);
  appStore.clear();
  return;
});
ipcMain.handle("api/storage:get", async (ev, key) => {
  console.log(ev.senderFrame.name, key);
  return appStore.get(key);
});
ipcMain.handle("api/storage:set", async (ev, key, value) => {
  console.log(
    ev.senderFrame.name,
    key,
    typeof value === "object" ? "[object]" : value
  );
  return appStore.set(key, value);
});
if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();
  initializeRemote();
  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    frame: false,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: "hidden",
    title: app.getName(),
  });

  if (isProd) {
    await mainWindow.loadURL("app://./index.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }
  ipcMain.on("quit", () => {
    if (mainWindow.closable) mainWindow.close();
    app.quit();
  });
  ipcMain.handle("api/dir:select", async () => {
    const folder = dialog.showOpenDialogSync(mainWindow, {
      properties: ["openDirectory", "createDirectory"],
    });
    return folder?.[0];
  });
  ipcMain.on("api/dir:open", async (ev, dir: string) => {
    if (dir) shell.openPath(dirname(dir));
  });
  ipcMain.on("relay", (ev, evName, ...args) => {
    console.log("[relay]\t", evName, ...args);
    mainWindow.webContents.send(evName, ...args);
  });
  enableRemoteOnWC(mainWindow.webContents);
  const downloadWorker = createDownloadWorker(mainWindow);
  ipcMain.on("api/add:download", async (ev, d: DownloadItem[]) => {
    if (d?.length > 0) {
      queue.enqueue(
        d.map(
          (x) => () =>
            downloadWorker.run({
              method: "addDownload",
              parameters: [x, defaultDownloadPath],
            })
        )
      );
    }
    if (queue.size > 0 && !queue.state.RUNNING) queue.start();
  });
  mainWindow.on("close", async () => {
    await downloadWorker.end();
  });
})();
app.on("window-all-closed", () => {
  app.quit();
});
