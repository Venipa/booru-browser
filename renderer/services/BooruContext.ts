import React, { createContext, useContext } from "react";
import { ServerType } from "renderer/stores/server";
import BooruService from "./BooruService";
export type BooruContextType = {
  active: ServerType | undefined;
  service: BooruService | undefined
}
const BooruContext = createContext<BooruContextType>({});

export default BooruContext;

export const useBooru = () => useContext(BooruContext);