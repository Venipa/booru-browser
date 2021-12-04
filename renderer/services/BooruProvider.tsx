import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { getLocaleCode, getlocaleByCode } from "./data";
import BooruContext from "./BooruContext";
import { useObservable } from "rxjs-hooks";
import { serverQuery, ServerType } from "renderer/stores/server";
import BooruService, { createFactory } from "./BooruService";
import { postsStore } from "renderer/stores/posts";
import DownloadService from "./DownloadService";
const downloadService = new DownloadService();
const BooruProvider = ({ children, ...props }: PropsWithChildren<any>) => {
  const active = useObservable(
    () => serverQuery.selectActive(),
    serverQuery.getActive()
  );
  const [service, setService] = useState<BooruService>();
  useEffect(() => {
    downloadService.watchQueue();
  });
  useEffect(() => {
    let service: BooruService | null;
    if (active && (service = createFactory(active))) {
      postsStore.remove();
      setService(service);
    }
  }, [active]);
  useEffect(() => {
    service?.get(0, {}).then((x) => {
      postsStore.upsertMany(x);
    });
  }, [service]);
  return (
    <BooruContext.Provider
      value={{
        active,
        service,
        addDownload: downloadService.addDownload.bind(downloadService),
        removeDownload: downloadService.removeDownload.bind(downloadService),
        cancelDownload: downloadService.cancelDownload.bind(downloadService),
      }}>
      {children}
    </BooruContext.Provider>
  );
};

export default BooruProvider;
