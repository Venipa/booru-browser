import {
  ActiveState,
  createEntityQuery,
  createEntityStore,
  EntityState,
  EntityStore,
  guid,
  Order,
  StoreConfig,
} from "@datorama/akita";
import produce from "immer";
import { BooruPost } from "./posts";
import { EndpointType, ServerType } from "./server";
export interface DownloadItem {
  id: string;
  post: BooruPost;
  path?: string;
  url: string;
  status?: string;
  pogress?: { loaded: number; total: number };
  from?: ServerType;
  date: string;
}
export interface DownloadItemState
  extends EntityState<DownloadItem, string>,
    ActiveState {}
@StoreConfig({
  name: "downloads",
  producerFn: produce,
})
class DownloadsStore extends EntityStore<DownloadItemState> {
  akitaPreAddEntity(entity: any): DownloadItem {
    if (!entity.id) entity.id = guid();
    entity.date = new Date().toISOString();
    return entity;
  }
}
export const downloadsStore = new DownloadsStore();
export const downloadsQuery = createEntityQuery(downloadsStore, {
  sortBy: (x) => Date.parse(x.date),
  sortByOrder: Order.DESC,
});
