import { ActiveState, createEntityQuery, createEntityStore, EntityState, Order } from '@datorama/akita';
import produce from 'immer';

export enum EndpointType {
  "danbooru_v2",
  "danbooru_php",
}
type EndpointListType = {
  [Property in keyof typeof EndpointType]: string;
};
export const EndpointList: EndpointListType = {
  danbooru_php: "Danbooru PHP",
  danbooru_v2: "Danbooru V2",
};
export const DEFAULT_SERVERS: ServerType[] = [
  {
    name: "Safebooru",
    url: "https://safebooru.org/",
    meta: {
      readonly: true,
      type: EndpointType.danbooru_php,
      added: new Date().toISOString(),
    },
  },
  {
    name: "Danbooru",
    url: "https://danbooru.donmai.us/",
    meta: {
      readonly: true,
      type: EndpointType.danbooru_v2,
      added: new Date().toISOString(),
    },
  },
];
export interface ServerType {
  name: string;
  url: string;
  nsfw?: boolean;
  options?: {
    showNSFW?: boolean;
    filter?: string;
  };
  auth?: {
    login: string;
    pass: string;
  };
  meta: {
    readonly: true;
    type: EndpointType;
    added: string;
  };
}
export interface ServerTypeState
  extends EntityState<ServerType, string>,
    ActiveState {}
export const serverStore = ((store) => {
  // edit / override methods

  return store;
})(
  createEntityStore<ServerTypeState>(
    {},
    { name: "servers", producerFn: produce, idKey: "name" }
  )
);
export const serverQuery = createEntityQuery(serverStore, {
  sortBy: (x) => (x.meta?.added ? Date.parse(x.meta.added) : 0),
  sortByOrder: Order.DESC,
});

export function initializeServers() {
  if (serverQuery.getCount() > 0) return;
  serverStore.upsertMany(DEFAULT_SERVERS);
  serverStore.setActive(DEFAULT_SERVERS[0].name);
}
