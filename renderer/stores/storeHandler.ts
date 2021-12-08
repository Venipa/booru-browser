import { persistState, selectPersistStateInit } from '@datorama/akita';
import { ipcRenderer } from 'electron';
import { Subscription } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import { map } from 'rxjs/operators';

import { downloadsQuery } from './downloads';

let _onInitSubscriber: Subscription | null | undefined;
export const useInitializedPersist = () =>
  useObservable(
    () =>
      selectPersistStateInit().pipe(
        map(() => {
          return true;
        })
      ),
    false
  );
const persistStore = async () => {
  if (_onInitSubscriber) {
    _onInitSubscriber.unsubscribe();
    _onInitSubscriber = null;
  }
  _onInitSubscriber = selectPersistStateInit().subscribe(() => {
    const queuedDownloads = downloadsQuery.getAll({
      filterBy: (x) => x.status === "active" || x.status === "pending",
    });
    if (queuedDownloads.length > 0) {
      console.log("queued downloads", queuedDownloads);
      ipcRenderer.send("api/add:download", queuedDownloads);
    }
  });
  return persistState({
    storage: {
      clear: async function () {
        return await ipcRenderer.invoke("api/storage:clear");
      },
      getItem: async function (key: string) {
        return await ipcRenderer.invoke("api/storage:get", key);
      },
      setItem: async function (key: string, value: string) {
        await ipcRenderer.invoke("api/storage:set", key, value);
      },
    },
    include: ["settings", "servers", "downloads"],
    enableInNonBrowser: true,
    key: "booru_store",
  });
};
export { persistStore };
