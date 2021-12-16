import NoSSR from "@/components/NoSSR";
import PostMasonry from "@/components/PostMasonry";
import PostThumbnailItem from "@/components/posts/PostThumbnailItem";
import { IconButton, Input } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { classNames } from "@library/helper";
import {
  createResizeObserver,
  Masonry,
  useInfiniteLoader,
  useMasonry,
  usePositioner,
  useResizeObserver,
} from "masonic";
import React, { memo, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HiRefresh } from "react-icons/hi";
import { AutoSizer, AutoSizer as div } from "react-virtualized";
import { useBooru } from "renderer/services/BooruContext";
import { BooruPost, postsQuery } from "renderer/stores/posts";
import { useObservable } from "rxjs-hooks";
import * as yup from "yup";

const schema = yup
  .object({
    search: yup.string().optional(),
  })
  .required();

const RenderItem = memo(
  ({ data: item, selected }: { data: BooruPost; selected?: boolean }) => {
    return <PostThumbnailItem item={item} selected={selected} key={item.id} />;
  }
);
function Home() {
  const booru = useBooru();
  const posts = useObservable(
    () => postsQuery.selectAll(),
    postsQuery.getAll()
  );
  const selected = useObservable(() => postsQuery.selectActive());
  const isLoading = useObservable(() => postsQuery.selectLoading(), false);
  const containerRef = useRef<HTMLElement>();
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isValid },
    watch,
  } = useForm({
    defaultValues: {
      search: booru.search ?? "",
    },
    resolver: yupResolver(schema),
    reValidateMode: "onBlur",
    mode: "onBlur",
  });
  const onSubmit = (data: typeof schema.__inputType) => {
    booru.service!.get(1, {
      q: data.search,
    });
  };
  const onReload = () => {
    const { search, page } = booru.service!.getState();
    return booru.service!.get(1, {
      q: search,
      reset: true,
    });
  };

  const [itemsLoaded, setItemsLoaded] = useState(0),
    [waitLoad, setWaitLoad] = useState(false);
  const fetchMoreItems = async (startIndex, stopIndex, currentItems) => {
    setWaitLoad(true);
    console.log("fetchMoreItems", startIndex, stopIndex, currentItems);
    const service = booru.service!;
    const { page, search } = service!.getState();
    setItemsLoaded(postsQuery.getCount());
    await service.get(page + 1, {
      q: search,
    });
    setWaitLoad(false);
  };
  const checkLoadMore = useInfiniteLoader(fetchMoreItems, {
    isItemLoaded: (index, items) => !!items?.[index],
    totalItems:
      !waitLoad && itemsLoaded < posts.length ? posts.length + 1 : itemsLoaded,
  });
  useEffect(() => {
    if (booru.search) setValue("search", booru.search);
  }, [booru.search]);
  return (
    <React.Fragment>
      <div className="absolute inset-0 overflow-hidden min-h-0">
        <div className="flex flex-col h-full">
          <div>
            <div className="bg-white bg-opacity-50 backdrop-blur h-16 flex items-center px-2.5 w-full z-10 space-x-2">
              <Controller
                name="search"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      value={field.value as any}
                      placeholder="Search"
                      variant="flushed"
                      onKeyUp={(ev) => {
                        if (ev.key === "Enter") onSubmit(getValues() as any);
                      }}
                      disabled={isLoading}
                    />
                  );
                }}
              />
              <IconButton
                icon={
                  <HiRefresh
                    className={classNames(!isLoading || "animate-spin")}
                  />
                }
                onClick={onReload}
                variant="ghost"
                colorScheme="brand"
                aria-label="reload items"
                disabled={isLoading}></IconButton>
            </div>
          </div>
          <div
            className="relative h-full overflow-y-auto overflow-x-hidden py-4 bg-black bg-opacity-50 rounded-none"
            ref={containerRef as any}>
            <NoSSR predicate={() => !!booru.service && containerRef.current}>
              <AutoSizer>
                {({ height }) => (
                  <PostMasonry
                    containerRef={containerRef as any}
                    height={height}
                    items={posts}
                    options={{
                      className: "absolute inset-0",
                      itemKey: (data: any) => data?.id,
                      onRender: checkLoadMore,
                      render: ({ data }) => (
                        <RenderItem
                          data={data as any}
                          selected={(data as BooruPost).id === selected?.id}
                        />
                      ),
                    }}
                  />
                )}
              </AutoSizer>
            </NoSSR>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
export default Home;
