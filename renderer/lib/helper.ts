import axios, { CancelToken, CancelTokenSource } from "axios";
import { clipboard, ipcRenderer, nativeImage } from "electron";
import { useCallback, useEffect, useRef, useState } from "react";
import { serverQuery } from "renderer/stores/server";
import { Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

export function classNames(...classes: (string | any | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
export const IS_SSR = typeof window === "undefined";

export async function copyImage(img: Blob) {
  clipboard.writeImage(
    nativeImage.createFromBuffer(Buffer.from(await img.arrayBuffer()))
  );
}
export function useKeyPress(targetKey: string) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);
  // If pressed key is our target key then set to true
  function downHandler({ key }: KeyboardEvent) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };
  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return keyPressed;
}

export async function testUniqueServer(name: string) {
  return !serverQuery.getAll({
    filterBy: (x) => x.name.toLowerCase() === name.toLowerCase(),
  }).length;
}
export function ObjectHasChange(value, nextValue) {
  return JSON.stringify(value) !== JSON.stringify(nextValue);
}
export function testHasChange() {
  let value;
  return (nextValue) => {
    const isTrue = JSON.stringify(value) !== JSON.stringify(nextValue);
    if (isTrue) value = nextValue;
    return isTrue;
  };
}
export const imageMatcher = new RegExp(/\.(jp(e)?g|png|gif)$/);
export const videoMatcher = new RegExp(/\.(mp4|webm)$/);
export const audioMatcher = new RegExp(/\.(mp3|m4a|ogg)$/);

export async function downloadFileAsBlob(
  url: string,
  cancelToken?: CancelToken
) {
  const data = await new Promise<Blob>((resolve, reject) => {
    axios
      .get(url, { responseType: "blob", cancelToken })
      .then((x) => x.data as Blob)
      .then((d) => {
        if (d.type.match(/\image\//)) return resolve(d);
        return reject(new Error("Invalid Image"));
      })
      .catch(reject);
  });
  const uri = URL.createObjectURL(data);
  return {
    data,
    uri,
  };
}
export function openDirectory(dir: string) {
  return ipcRenderer.send("api/dir:open", dir);
}
export const useCancelToken = (criteria?: any) => {
  const axiosSource = useRef<CancelTokenSource | null>(null);
  const newCancelToken = useCallback(() => {
    axiosSource.current = axios.CancelToken.source();
    return axiosSource.current.token;
  }, []);
  const prevCriteria = useRef<any>();
  useEffect(() => {
    if (prevCriteria !== criteria) axiosSource.current?.cancel();
    prevCriteria.current = criteria;
    return () => {
      axiosSource.current?.cancel();
    };
  }, []);

  return { newCancelToken, isCancel: axios.isCancel };
};

export function hasChange<T>(a: T, b: T, mapper?: (a: T) => any) {
  if (mapper) return JSON.stringify(mapper(a)) !== JSON.stringify(mapper(b));
  return JSON.stringify(a) !== JSON.stringify(b);
}
export function DistinctEqual(original: any, ...args: any[]) {
  const _original = JSON.stringify(original);
  return args.every((x) => JSON.stringify(x) === _original);
}
export function distinctUntilChangedJson<T = any>(mapper?: (a: T) => any) {
  return (source: Observable<T>) =>
    source.pipe(
      distinctUntilChanged((a, b) => {
        return !hasChange(a, b, mapper);
      })
    );
}
export const testFileType = (s) => {
  if (!s) return "other";
  else if (imageMatcher.test(s)) return "image";
  else if (videoMatcher.test(s)) return "video";
  else if (audioMatcher.test(s)) return "audio";
  else return "other";
};
