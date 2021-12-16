import { useLayoutEffect, useState } from "react";

const defaultSize = { width: 0, height: 0 };
const useSize = <T extends HTMLElement = HTMLElement>(
  ref: React.MutableRefObject<T | null>,
  deps: any[] = []
): { width: number; height: number } => {
  const [size, setSize] =
    useState<{ width: number; height: number }>(defaultSize);

  useLayoutEffect(() => {
    const { current } = ref;

    if (current) {
      const handleResize = () => {
        const computedStyle = getComputedStyle(current);
        const float = parseFloat;
        const width =
          current.clientWidth -
          float(computedStyle.paddingTop) -
          float(computedStyle.paddingBottom);
        const height =
          current.clientHeight -
          float(computedStyle.paddingLeft) -
          float(computedStyle.paddingRight);
        setSize({ height, width });
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps.concat(ref.current));

  return size;
};
export default useSize;
