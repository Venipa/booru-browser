import { createQuery, createStore } from "@datorama/akita";
import produce from "immer";
export interface SettingsType {
  downloadPath: string;
  startOnBoot: boolean;
  autoUpdate: boolean;
}
export const settingsStore = createStore<SettingsType>(
  { startOnBoot: false, autoUpdate: true },
  { name: "settings", producerFn: produce }
);
export const settingsQuery = createQuery<SettingsType>(settingsStore);
