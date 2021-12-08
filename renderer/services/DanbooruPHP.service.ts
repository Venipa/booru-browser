import { Axios } from "axios";
import { clamp } from "lodash-es";
import { BooruPost } from "renderer/stores/posts";
import { ServerType } from "renderer/stores/server";

import BooruService, { BooruHttpOptions } from "./BooruService";

export class DanbooruPHPService implements BooruService {
  private http: Axios;
  lastSearch?: string | undefined;
  readonly defaultParams: { [key: string]: any } = {
    page: "dapi",
    json: 1,
    s: "post",
    q: "index",
  };
  constructor(private _server: ServerType) {
    this.http = new Axios({
      baseURL: _server.url,
    });
  }
  private get baseUrl() {
    return this._server.url.replace(/\/$/, "");
  }
  async get(page: number = 1, args: Partial<BooruHttpOptions>) {
    return await this.http
      .get(`/index.php`, {
        params: {
          ...this.defaultParams,
          pid: clamp(page, 1, page),
          tags: args.q,
        },
      })
      .then((x) => x.data ? JSON.parse(x.data) : [])
      .then((x) => {
        if (args.q) this.lastSearch = args.q;
        if (x?.length > 0) {
          return x
            .filter((x: any) => x?.id)
            .map(
              ({
                id,
                height,
                width,
                change,
                directory,
                hash,
                score,
                tags,
                image,
                rating,
                ...other
              }: any) => {
                const baseUrl = this.baseUrl;
                const imageId = image.match(/^(.*)\./)[1];
                const type = `${image}`.match(/\.(\w+)$/)?.[1];
                const source = `${baseUrl}/images/${directory}/${image}`;
                const next: BooruPost = {
                  id,
                  height,
                  width,
                  hash,
                  score,
                  tags: tags?.split(" ") || [],
                  rating: "safe",
                  image,
                  sample: other.sample === false ? source : `${baseUrl}/samples/${directory}/sample_${imageId}.jpg`,
                  thumbnail: `${baseUrl}/thumbnails/${directory}/thumbnail_${imageId}.jpg`,
                  source,
                  date: change
                    ? new Date(change * 1000).toISOString()
                    : undefined,
                  type,
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
    return `${uri}/index.php?page=post&s=view&id=${id}`;
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
