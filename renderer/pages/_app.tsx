import '@/styles/globals.scss';

import { DialogProvider, DialogRoot } from '@/components/Dialog';
import LoadingView from '@/components/LoadingView';
import React from 'react';
import { useEffect } from 'react';
import BaseLayout from 'renderer/Layouts/BaseLayout';
import BooruProvider from 'renderer/services/BooruProvider';
import { initializeServers } from 'renderer/stores/server';
import { persistStore, useInitializedPersist } from 'renderer/stores/storeHandler';

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const isInitialized = useInitializedPersist();
  useEffect(() => {
    persistStore();
    initializeServers();
  }, []);
  if (!isInitialized)
    return (
      <React.Fragment>
        <LoadingView />
      </React.Fragment>
    );
  const getLayout = (Component as any).getLayout ?? ((page: any) => page);
  return (
    <React.Fragment>
      <DialogProvider>
        <DialogRoot />
        <div className="h-full w-full flex flex-col z-10">
          <BooruProvider>
            <BaseLayout>{getLayout(<Component {...pageProps} />)}</BaseLayout>
          </BooruProvider>
          <div className="app-background"></div>
        </div>
      </DialogProvider>
    </React.Fragment>
  );
}

export default MyApp;
