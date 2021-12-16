import { Axios } from "axios";
import { clamp } from "lodash-es";
import { BooruPost, BooruPostState } from "renderer/stores/posts";
import { ServerType } from "renderer/stores/server";
import BooruServiceInterals from "./BooruInteralService";
import BooruService, { BooruHttpOptions } from "./BooruService";

export class DanbooruService implements BooruService, BooruServiceInterals {
  private http: Axios;
  search?: string | undefined;
  page: number = 1;
  constructor(private _server: ServerType) {
    this.http = new Axios({
      baseURL: _server.url,
    });
  }
  getState() {
    return {
      search: this.search,
      page: this.page,
    };
  }
  async get(
    page: number = 1,
    args: Partial<BooruHttpOptions & { tags: string[] }>
  ) {
    let search = args.q,
      tags = search?.split(" ") || undefined;
    return await this.http
      .get(`/posts.json`, {
        params: {
          [`search[name_matches]`]: search || "*",
          page: clamp(page, 1, page),
          tags: tags?.join(" "),
        },
      })
      .then((x) => (x.data ? JSON.parse(x.data) : []))
      .then((x) => {
        if (x?.length > 0) {
          return x
            .filter((x: any) => x?.id)
            .map(
              ({
                id,
                image_height: height,
                image_width: width,
                md5: hash,
                score,
                tags_string,
                tag_string_general,
                file_url: image,
                large_file_url: sample,
                preview_file_url: thumbnail,
                created_at,
                updated_at,
                tag_string_copyright,
                tag_string_artist,
                rating,
                ...other
              }: any) => {
                const next: BooruPost = {
                  id,
                  height,
                  width,
                  hash,
                  score,
                  tags: (tags_string || tag_string_general)?.split(" ") || [],
                  rating:
                    {
                      s: "safe",
                      e: "nsfw",
                      n: "nsfw",
                    }[rating as string] || `${rating}`,
                  image,
                  sample,
                  thumbnail,
                  source: image,
                  artist: `${tag_string_artist || ""}`.split(" ")[0] || null,
                  category:
                    `${tag_string_copyright || ""}`.split(" ")[0] || null,
                  refs: {
                    pixiv: other.pixiv_id,
                    isLarge: !!other.has_large,
                    size: other.file_size ? other.file_size / 1024 : null,
                  },
                  type: other.file_ext || other.type,
                  date: updated_at || created_at,
                };
                return next;
              }
            );
        }
        return [];
      });
  }
  createPostUrl(id: string | number) {
    const uri = this._server.url.replace(/\/$/, "");
    return `${uri}/posts/${id}`;
  }
  getByTop(q: string, page?: number): Promise<any> {
    throw new Error("Method not implemented.");
  }
  getByHot(q: string, page?: number): Promise<any> {
    throw new Error("Method not implemented.");
  }
  instance() {
    return this;
  }
}
