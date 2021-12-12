import { guid, Order } from "@datorama/akita";
import { ipcRenderer } from "electron";
import {
  DownloadItem,
  downloadsQuery,
  downloadsStore,
} from "renderer/stores/downloads";
import { BooruPost, FileType } from "renderer/stores/posts";
import { serverQuery } from "renderer/stores/server";
import { settingsQuery } from "renderer/stores/settings";
import { Subject } from "rxjs";
import {
  filter,
  first,
  map,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  timeout,
} from "rxjs/operators";

function watchStatus(ev: any, id: string, status: string, ...args: any[]) {
  console.log("status", id, status, ...args);
  const isCompleted = downloadsQuery.getEntity(id)?.status === "completed";
  if (isCompleted) return;
  if (status === "active") {
    const [loaded, total] = args;
    downloadsStore.update(id, (state) => {
      state.status = status;
      state.pogress = { loaded: ~~loaded, total: ~~total };
    });
  } else if (status === "removed") {
    downloadsStore.remove(id);
  } else if (status === "completed") {
    const [entity, loaded, total] = args;
    downloadsStore.upsert(id, {
      ...entity,
      id,
      status,
      pogress: {
        loaded: ~~loaded,
        total: ~~total,
      },
    });
  } else {
    downloadsStore.update(id, (state) => {
      state.status = status;
    });
  }
}
export default class DownloadService {
  private _queueActive: Subject<void> | undefined;
  constructor() {}

  addDownload(d: BooruPost, fileType?: FileType) {
    const id = guid();
    const {downloadPath} = settingsQuery.getValue();
    const activeServer = serverQuery.getActive();
    if (fileType === undefined && d.sample.match(/\.(mp4|mp3|webm|mov)$/)) {
      fileType = "video";
    }
    const source = fileType === "video" ? d.sample : d.source;
    const type = source.match(/\.(\w+)$/)?.[1];
    downloadsStore.upsert(id, {
      id,
      date: new Date().toISOString(),
      path: downloadPath
        ? downloadPath?.replace(/\/$/, "") + `/${d.id}.${type || d.type}`
        : undefined,
      post: d,
      url: source,
      from: activeServer,
      status: "pending",
    });
    return new Promise<DownloadItem | undefined>((resolve, reject) => {
      return downloadsQuery
        .selectEntity(id)
        .pipe(first((x) => x?.status === "completed"))
        .subscribe(resolve, reject);
    });
  }
  removeDownload(id: string) {
    const item = downloadsStore.remove(id) as DownloadItem;
    ipcRenderer.send("api/cancel:download/" + id);
  }
  cancelDownload(id: string) {
    ipcRenderer.send("api/cancel:download/" + id);
  }
  watchQueue() {
    this.stopQueue();
    this._queueActive = new Subject<void>();
    ipcRenderer.on("api/status:download", watchStatus);
    downloadsQuery
      .selectAll({
        sortByOrder: Order.ASC,
        sortBy: (x) => Date.parse(x.date),
        filterBy: (x) => !!x.date && x.status === "pending",
      })
      .pipe(
        takeUntil(this._queueActive),
        switchMap((items) => {
          console.log("items added to queue", items);
          return items.length > 0
            ? Promise.resolve(ipcRenderer.send("api/add:download", items))
            : Promise.resolve();
        })
      )
      .subscribe();
  }
  get queueActive() {
    return !!this._queueActive && !this._queueActive.closed;
  }
  stopQueue() {
    this._queueActive?.next();
    this._queueActive?.complete();
    ipcRenderer.off("api/status:download", watchStatus);
  }
}
