import { clipboard, nativeImage } from "electron";
import { useEffect, useState } from "react";
import { serverQuery } from "renderer/stores/server";

export function classNames(...classes: (string | any | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
export const IS_SSR = typeof window === "undefined";

export function copyImage(
  imgCap: HTMLImageElement,
  size: { width: number; height: number }
) {
  var imgCanvas = document.createElement("canvas");
  const { height, width } = size;
  imgCanvas.width = width;
  imgCanvas.height = height;
  const el = document.body.appendChild(imgCanvas);
  var originalContext = el.getContext("2d")!;
  originalContext.drawImage(imgCap, 0, 0);

  const image = nativeImage.createFromDataURL(imgCanvas.toDataURL());
  clipboard.writeImage(image);
  el.remove();
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
  return !serverQuery.getAll({filterBy: x => x.name.toLowerCase() === name.toLowerCase()}).length;
}

export const imageMatcher = new RegExp(/\.(jp(e)?g|png|gif)$/);
export const videoMatcher = new RegExp(/\.(mp4|webm)$/);
export const audioMatcher = new RegExp(/\.(mp3|m4a|ogg)$/);