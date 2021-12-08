import {
  ActiveState,
  createEntityQuery,
  createEntityStore,
  EntityState,
  EntityStore,
  Order,
  Store,
  StoreConfig,
} from "@datorama/akita";
import produce from "immer";
export type FileType = "image" | "video" | "audio" | "other";
export interface BooruPost {
  id: string;
  height: number;
  width: number;
  hash: string;
  score: number;
  tags: string[];
  image: string;
  sample: string;
  artist?: string | null;
  category?: string | null;
  type?: string;
  thumbnail: string;
  rating: string;
  source: string;
  refs?: Partial<{ [key: string]: any }>;
  date?: string;
}
export interface BooruPostState
  extends EntityState<BooruPost, string>,
    ActiveState {}
@StoreConfig({
  name: "posts",
  producerFn: produce,
})
class PostsStore extends EntityStore<BooruPostState> {
  constructor() {
    super();
  }
}
export const postsStore = new PostsStore();
export const postsQuery = createEntityQuery(postsStore, {
  sortBy: (x) => Date.parse(x.date),
  sortByOrder: Order.DESC,
});
