import { app, ipcMain } from "electron";
import { writeFile } from "fs";
import { clamp, debounce } from "lodash";
import { cpus } from "os";
import { DownloadItem } from "renderer/stores/downloads";
import PQueue from "queue-promise";
import path, { dirname } from "path";
import XMLHttpRequest from "xhr2";
import { access } from "fs/promises";
export enum PState {
  IDLE = 0,
  RUNNING = 1,
  STOPPED = 2,
}
export const queue = new PQueue({
  start: false,
  concurrent: clamp(cpus().length / 2, 1, 6),
});
queue.on("reject", (...args) => console.error("error", ...args));
queue.on("resolve", (...args) => console.log("completed", ...args));

export async function downloadNative(
  d: DownloadItem,
  onUpdate: (id: string, status: string, ...args: any[]) => void
) {
  onUpdate(d.id, "active");
  const type = d.post.type || d.post.source.match(/\.(\w+)$/)?.[1];
  const newPath = path.normalize(
    d.path ?? path.join(app.getPath("downloads"), `${d.id}.${type}`)
  );
  if (
    !(await access(dirname(newPath))
      .then(() => true)
      .catch(() => false))
  ) {
    onUpdate(d.id, "cancelled");
    throw new Error("Path does not exist, " + newPath);
  }
  d.path = newPath;
  let cancelled = false;
  ipcMain.once("api/cancel:download/" + d.id, () => {
    cancelled = true;
  });
  const data = await new Promise<Buffer>((resolve, reject) => {
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open("GET", d.post.source);
    xhr.responseType = "arraybuffer";
    xhr.onprogress = (ev: ProgressEvent) => {
      if (cancelled) {
        xhr.abort();
        onUpdate(d.id, "cancelled");
        return reject(new Error("download.cancelled"));
      }
      if (ev.lengthComputable) onUpdate(d.id, "active", ev.loaded, ev.total);
    };
    xhr.onload = (ev) => {
      resolve(Buffer.from(xhr.response, "binary"));
    };
    xhr.onerror = (ev) => {
      onUpdate(d.id, "cancelled");
      reject("something-went-wrong");
    };
    xhr.send();
  });
  await new Promise<void>((resolve, reject) => {
    writeFile(newPath, data, "binary", (err) => {
      if (err) reject(err);
      resolve();
    });
  });
  onUpdate(d.id, "completed", d);
  return d;
}
