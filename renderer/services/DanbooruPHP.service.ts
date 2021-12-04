import { Axios } from 'axios';
import { clamp } from 'lodash-es';
import { BooruPost } from 'renderer/stores/posts';
import { ServerType } from 'renderer/stores/server';

import BooruService, { BooruHttpOptions } from './BooruService';

export class DanbooruPHPService implements BooruService {
  private http: Axios;
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
        }
      })
      .then((x) => JSON.parse(x.data))
      .then((x) => {
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
                const next: BooruPost = {
                  id,
                  height,
                  width,
                  hash,
                  score,
                  tags: tags?.split(" ") || [],
                  rating: "safe",
                  image,
                  sample: `${baseUrl}/samples/${directory}/sample_${imageId}.jpg`,
                  thumbnail: `${baseUrl}/thumbnails/${directory}/thumbnail_${imageId}.jpg`,
                  source: `${baseUrl}/images/${directory}/${image}`,
                  date: change
                    ? new Date(change * 1000).toISOString()
                    : undefined,
                  type: `${image}`.match(/\.(\w+)$/)?.[1],
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
