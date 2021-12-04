import { app, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import { DownloadItem } from "renderer/stores/downloads";
import { createWindow } from "./helpers";
import { downloadNative, queue, PState } from "./helpers/downloadService";

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

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
  ipcMain.on("api/add:download", async (ev, d: DownloadItem[]) => {
    console.log("added dl", d);
    if (d?.length > 0) {
      queue.enqueue(
        d.map(
          (x) => () =>
            downloadNative(x, (id, status, ...args) => {
              mainWindow.webContents.send("api/status:download", id, status, ...args);
            })
        )
      );
    }
    if (queue.size > 0 && !queue.state.RUNNING) queue.start();
  });
})();
app.on("window-all-closed", () => {
  app.quit();
});
