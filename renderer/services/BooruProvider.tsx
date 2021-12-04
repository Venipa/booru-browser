import React, { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { postsStore } from 'renderer/stores/posts';
import { serverQuery } from 'renderer/stores/server';
import { useObservable } from 'rxjs-hooks';

import BooruContext from './BooruContext';
import BooruService, { createFactory } from './BooruService';
import DownloadService from './DownloadService';

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
