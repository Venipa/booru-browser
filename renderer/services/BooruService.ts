import { BooruPost, postsQuery, postsStore } from "renderer/stores/posts";
import { EndpointType, ServerType } from "renderer/stores/server";
import { settingsQuery, settingsStore } from "renderer/stores/settings";
import { DanbooruPHPService } from "./DanbooruPHP.service";
import { DanbooruService } from "./DanbooruV2.service";

export default interface BooruService<T = any> {
  lastSearch?: string;
  get(page: number, args: Partial<BooruHttpOptions>): Promise<BooruPost[]>;
  getByTop(q: string, page?: number): Promise<BooruPost[]>;
  getByHot(q: string, page?: number): Promise<BooruPost[]>;
  createPostUrl(id: string | number): string;

  instance(): T;
}
const withStoreBinding = (s: BooruService) => {
  const lastSearchUpdate = (q: string) =>
    settingsStore.update((state) => {
      state.search = q;
    });
  s.get = ((fn) => {
    return (...args: any[]) => {
      const lastSearch = settingsQuery.getValue().search;
      postsStore.setLoading(true);
      return (fn.bind(s) as any)(...args).then((x) => {
        if (args[1]?.q !== lastSearch) {
          const prevActive = postsQuery.getActiveId() as string;
          postsStore.set(x);
          if (prevActive && postsQuery.hasEntity(prevActive))
            postsStore.setActive(prevActive);
        } else postsStore.upsertMany(x);
        lastSearchUpdate(args[1]?.q);
        postsStore.setLoading(false);
        return x;
      });
    };
  })(s.get) as typeof s.get;
  return s;
};
export const createFactory = (s: ServerType): BooruService | null => {
  let service = (() => {
    if (s.meta.type === EndpointType.danbooru_v2)
      return new DanbooruService(s) as BooruService<DanbooruService>;
    if (s.meta.type === EndpointType.danbooru_php)
      return new DanbooruPHPService(s) as BooruService<DanbooruPHPService>;
  })();
  if (service) service = withStoreBinding(service);
  return service || null;
};
export interface BooruHttpOptions {
  q: string;
  [key: string]: any;
}
