import { ipcRenderer } from "electron";
import { ThreadExport } from "electron-threads";
import { writeFile } from "fs";
import { access } from "fs/promises";
import { throttle } from "lodash";
import path, { dirname } from "path";
import { DownloadItem } from "renderer/stores/downloads";
import { asyncScheduler, BehaviorSubject, interval, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import XMLHttpRequest2 from "xhr2";
const onUpdate = (id: string, status: string, ...args: any[]) => {
  return ipcRenderer.send("relay", "api/status:download", id, status, ...args);
};
async function handleDownload(d: DownloadItem, defaultPath: string) {
  let state = new BehaviorSubject<any>(null);
  const completedSubject = new Subject<void>();
  const completedSubject$destroy = () => {
    completedSubject.next();
    completedSubject.complete();
  };
  onUpdate(d.id, "active");
  const type =
    d.url?.match(/\.(\w+)$/)?.[1] ||
    d.post.type ||
    d.post.source?.match(/\.(\w+)$/)?.[1];
  d.post.sample?.match(/\.(\w+)$/)?.[1];
  const newPath = path.normalize(
    d.path ?? path.join(defaultPath, `${d.id}.${type}`)
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
  d.post.type = type;
  let cancelled = false;
  ipcRenderer.once("api/cancel:download/" + d.id, () => {
    cancelled = true;
  });
  const [data, dataLoaded, dataTotal] = await new Promise<[Buffer, number, number]>((resolve, reject) => {
    const statusInterval = interval(100)
      .pipe(takeUntil(completedSubject))
      .subscribe(() => {
        const newState = state.getValue();
        if (newState) {
          const [id, status, ...args] = newState;
          onUpdate(id, status, ...args);
        }
      });
    let xhr: XMLHttpRequest = new XMLHttpRequest2();
    xhr.open("GET", d.post.source);
    xhr.responseType = "arraybuffer";
    xhr.onprogress = (ev: ProgressEvent) => {
      if (cancelled) {
        xhr.abort();
        onUpdate(d.id, "cancelled");
        return reject(new Error("download.cancelled"));
      }
      if (ev.lengthComputable)
        state.next([d.id, "active", ev.loaded, ev.total]);
    };
    xhr.onload = (ev) => {
      resolve([Buffer.from(xhr.response, "binary"), ev.loaded, ev.total]);
    };
    xhr.onerror = (ev) => {
      onUpdate(d.id, "cancelled");
      reject("something-went-wrong");
    };
    xhr.send();
  }).catch((err) => {
    completedSubject$destroy();
    return Promise.reject(err);
  });
  await new Promise<void>((resolve, reject) => {
    writeFile(newPath, data, "binary", (err) => {
      if (err) reject(err);
      resolve();
    });
  }).catch((err) => {
    onUpdate(d.id, "error");
    completedSubject$destroy();
    return Promise.reject(err);
  });
  onUpdate(d.id, "completed", d, dataLoaded, dataTotal);
  return d;
}

ThreadExport.export({
  addDownload: handleDownload,
});
