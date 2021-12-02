import { clipboard, nativeImage } from "electron";

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
