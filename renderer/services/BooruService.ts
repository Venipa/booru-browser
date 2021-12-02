import { BooruPost } from "renderer/stores/posts";
import { EndpointType, ServerType } from "renderer/stores/server";
import { DanbooruService } from "./DanbooruV2.service";

export default interface BooruService<T = any> {
  get(page: number, args: Partial<BooruHttpOptions>): Promise<BooruPost[]>;
  getByTop(q: string, page?: number): Promise<BooruPost[]>;
  getByHot(q: string, page?: number): Promise<BooruPost[]>;
  createPostUrl(id: string | number): string;
}

export const createFactory = (s: ServerType): BooruService | null => {
  if (s.meta.type === EndpointType.danbooru_v2) return new DanbooruService(s) as BooruService<DanbooruService>;
  return null;
};
export interface BooruHttpOptions {
  q: string,
  [key: string]: any;
}
