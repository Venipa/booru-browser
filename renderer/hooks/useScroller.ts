import { useLayoutEffect, useState } from "react";

const useScroller = <T extends HTMLElement = HTMLElement>(
  ref: React.MutableRefObject<T | null>
): { scrollTop: number; isScrolling: boolean } => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  useLayoutEffect(() => {
    const { current } = ref;
    let tick: number | undefined;

    if (current) {
      const handleScroll = () => {
        if (tick) return;
        tick = window.requestAnimationFrame(() => {
          setScrollTop(current.scrollTop);
          tick = void 0;
        });
      };

      current.addEventListener("scroll", handleScroll);
      return () => {
        current.removeEventListener("scroll", handleScroll);
        if (tick) window.cancelAnimationFrame(tick);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);

  useLayoutEffect(() => {
    setIsScrolling(true);
    const to = window.setTimeout(() => {
      // This is here to prevent premature bail outs while maintaining high resolution
      // unsets. Without it there will always bee a lot of unnecessary DOM writes to style.
      setIsScrolling(false);
    }, 1000 / 6);
    return () => window.clearTimeout(to);
  }, [scrollTop]);

  return { scrollTop, isScrolling };
};
export default useScroller;
