import React, { createContext, useContext } from 'react';
import { BooruPost, FileType } from 'renderer/stores/posts';
import { ServerType } from 'renderer/stores/server';

import BooruService from './BooruService';

export type BooruContextType = {
  active: ServerType | undefined;
  service: BooruService | undefined;
  addDownload: (x: BooruPost, fileType?: FileType) => void;
  cancelDownload: (x: string) => void;
  removeDownload: (x: string) => void;
};
const BooruContext = createContext<BooruContextType>({} as any);

export default BooruContext;

export const useBooru = () => useContext(BooruContext);
