import {
  ActiveState,
  createEntityQuery,
  createEntityStore,
  EntityState,
  Order,
} from "@datorama/akita";
import produce from "immer";
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

export const postsStore = createEntityStore<BooruPostState>(
  {},
  { name: "posts", producerFn: produce }
);
export const postsQuery = createEntityQuery(postsStore, {
  sortBy: (x) => Date.parse(x.date),
  sortByOrder: Order.DESC,
});
