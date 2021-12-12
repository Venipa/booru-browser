import { BrowserWindow } from 'electron';
import { ElectronThread } from 'electron-threads';
import { clamp } from 'lodash';
import { cpus } from 'os';
import path from 'path';
import PQueue from 'queue-promise';

const concurrentMax = clamp(cpus().length / 2, 1, 6);
const cwd = process.cwd();
export const queue = new PQueue({
  start: false,
  concurrent: concurrentMax,
});
queue.on("reject", (...args) => console.error("error", ...args));
queue.on("resolve", (...args) => console.log("completed", ...args));
export const createDownloadWorker = (win: BrowserWindow) => {
  const module = path.join(__dirname, "download.worker");
  return new ElectronThread(
    {
      module,
      options: {
        maxConcurrentThreads: concurrentMax,
      },
    },
    win
  );
};

export enum PState {
  IDLE = 0,
  RUNNING = 1,
  STOPPED = 2,
}
