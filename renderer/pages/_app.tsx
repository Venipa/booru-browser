import React from "react";
import type { AppProps } from "next/app";

import "@/styles/globals.scss";
import BaseLayout from "renderer/Layouts/BaseLayout";
import { useEffect } from "react";
import { persistState } from "@datorama/akita";
import { initializeServers } from "renderer/stores/server";
import BooruProvider from "renderer/services/BooruProvider";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    persistState({});
    initializeServers();
  });
  const getLayout = (Component as any).getLayout ?? ((page: any) => page);
  return (
    <React.Fragment>
      <div className="h-full w-full flex flex-col z-10">
        <BooruProvider>
          <BaseLayout>{getLayout(<Component {...pageProps} />)}</BaseLayout>
        </BooruProvider>
        <div className="app-background"></div>
      </div>
    </React.Fragment>
  );
}

export default MyApp;
