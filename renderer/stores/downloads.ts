import {
  ActiveState,
  createEntityQuery,
  createEntityStore,
  EntityState,
  guid,
  Order,
} from "@datorama/akita";
import produce from "immer";
import { BooruPost } from "./posts";
export interface DownloadItem {
  id: string;
  post: BooruPost;
  path?: string;
  url: string;
  status?: string;
  pogress?: { loaded: number; total: number };
  date: string;
}
export interface DownloadItemState
  extends EntityState<DownloadItem, string>,
    ActiveState {}

export const downloadsStore = ((store) => {
  ((preAdd) => {
    store.akitaPreAddEntity = (entity: any) => {
      entity.id = guid();
      entity.date = new Date().toISOString();
      return preAdd.bind(store)(entity);
    };
  })(store.akitaPreAddEntity);

  return store;
})(
  createEntityStore<DownloadItemState>(
    {},
    { name: "downloads", producerFn: produce }
  )
);
export const downloadsQuery = createEntityQuery(downloadsStore, {
  sortBy: (x) => Date.parse(x.date),
  sortByOrder: Order.DESC,
});
