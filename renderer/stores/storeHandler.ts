import { persistState } from "@datorama/akita";

const persistStore = async () =>
  persistState({
    storage: localStorage,
    include: ["settings", "servers", "downloads"],
    enableInNonBrowser: true,
    key: "booru_store"
  });
export { persistStore }