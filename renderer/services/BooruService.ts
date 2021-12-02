import { BooruPost } from "renderer/stores/posts";
import { EndpointType, ServerType } from "renderer/stores/server";
import { DanbooruPHPService } from "./DanbooruPHP.service";
import { DanbooruService } from "./DanbooruV2.service";

export default interface BooruService<T = any> {
  get(page: number, args: Partial<BooruHttpOptions>): Promise<BooruPost[]>;
  getByTop(q: string, page?: number): Promise<BooruPost[]>;
  getByHot(q: string, page?: number): Promise<BooruPost[]>;
  createPostUrl(id: string | number): string;

  instance(): T;
}

export const createFactory = (s: ServerType): BooruService | null => {
  if (s.meta.type === EndpointType.danbooru_v2) return new DanbooruService(s) as BooruService<DanbooruService>;
  if (s.meta.type === EndpointType.danbooru_php) return new DanbooruPHPService(s) as BooruService<DanbooruPHPService>;
  return null;
};
export interface BooruHttpOptions {
  q: string,
  [key: string]: any;
}
