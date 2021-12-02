import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { getLocaleCode, getlocaleByCode } from "./data";
import BooruContext from "./BooruContext";
import { useObservable } from "rxjs-hooks";
import { serverQuery, ServerType } from "renderer/stores/server";
import BooruService, { createFactory } from "./BooruService";
import { postsStore } from "renderer/stores/posts";

const BooruProvider = ({ children, ...props }: PropsWithChildren<any>) => {
  const active = useObservable(
    () => serverQuery.selectActive(),
    serverQuery.getActive()
  );
  const [service, setService] = useState<BooruService>();
  useEffect(() => {
    let service: BooruService | null;
    if (active && (service = createFactory(active))) {
      postsStore.remove();
      setService(service);
    }
  }, [active]);
  useEffect(() => {
    service?.get(0, {}).then((x) => {
      postsStore.upsertMany(x);
    });
  }, [service]);
  return (
    <BooruContext.Provider
      value={{
        active,
        service,
      }}>
      {children}
    </BooruContext.Provider>
  );
};

export default BooruProvider;
