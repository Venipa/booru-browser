import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { postsQuery, postsStore } from "renderer/stores/posts";
import { serverQuery } from "renderer/stores/server";
import { settingsQuery } from "renderer/stores/settings";
import { useObservable } from "rxjs-hooks";

import BooruContext from "./BooruContext";
import BooruService, { createFactory } from "./BooruService";
import DownloadService from "./DownloadService";

const downloadService = new DownloadService();
const BooruProvider = ({ children, ...props }: PropsWithChildren<any>) => {
  const active = useObservable(
    () => serverQuery.selectActive(),
    serverQuery.getActive()
  );
  const activePost = useObservable(() => postsQuery.selectActive(), postsQuery.getActive());
  const search = useObservable(() => settingsQuery.select((x) => x.search));
  const [service, setService] = useState<BooruService>();
  useEffect(() => {
    downloadService.watchQueue();
    return () => {
      downloadService.stopQueue();
    };
  }, []);
  useEffect(() => {
    let service: BooruService | null;
    if (active && (service = createFactory(active))) {
      postsStore.remove();
      setService(service);
    }
  }, [active]);
  useEffect(() => {
    service?.get(1, {
      q: service?.getState().search ?? settingsQuery.getValue().search,
    });
  }, [service]);
  return (
    <BooruContext.Provider
      value={{
        active,
        service,
        search,
        addDownload: downloadService.addDownload,
        removeDownload: downloadService.removeDownload.bind(downloadService),
        cancelDownload: downloadService.cancelDownload.bind(downloadService),
        activePost,
      }}>
      {children}
    </BooruContext.Provider>
  );
};

export default BooruProvider;
