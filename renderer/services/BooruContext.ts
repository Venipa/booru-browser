import React, { createContext, useContext } from "react";
import { BooruPost } from "renderer/stores/posts";
import { ServerType } from "renderer/stores/server";
import BooruService from "./BooruService";
export type BooruContextType = {
  active: ServerType | undefined;
  service: BooruService | undefined;
  addDownload: (x: BooruPost) => void;
  cancelDownload: (x: string) => void;
  removeDownload: (x: string) => void;
};
const BooruContext = createContext<BooruContextType>({} as any);

export default BooruContext;

export const useBooru = () => useContext(BooruContext);
