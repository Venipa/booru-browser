import {
  RenderComponentProps,
  useContainerPosition,
  useMasonry,
  UseMasonryOptions,
  usePositioner,
  useResizeObserver,
  useScroller,
} from "masonic";
import {
  ComponentType,
  CSSProperties,
  memo,
  MutableRefObject,
  useRef,
} from "react";
import useSize from "renderer/hooks/useSize";
interface Props<T = any> {
  containerRef?: MutableRefObject<HTMLElement>;
  items: T[];
  height: number;
  options: Partial<UseMasonryOptions<T>>;
}
const WallCellStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
};
function PostMasonry<T = any>({
  containerRef,
  height,
  items,
  options,
  ...props
}: Props<T>) {
  const { offset, width } = useContainerPosition(containerRef as any, [
    containerRef?.current.clientWidth,
    items.length
  ]);
  const { scrollTop, isScrolling } = useScroller(offset);
  const positioner = usePositioner({
    width,
    columnWidth: 200,
    columnGutter: 8,
  });
  const resizeObserver = useResizeObserver(positioner);
  const Wall = useMasonry<T>({
    positioner,
    resizeObserver,
    items,
    height,
    scrollTop,
    isScrolling,
    itemStyle: WallCellStyle,
    overscanBy: 6,
    ...(options as any),
  });

  return <>{Wall}</>;
}
export default memo(PostMasonry);
