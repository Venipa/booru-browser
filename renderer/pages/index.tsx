import FormControl from "@/components/FormControl";
import PostThumbnailItem from "@/components/posts/PostThumbnailItem";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useKeyPress } from "@library/helper";
import { clamp } from "lodash-es";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Masonry from "react-masonry-css";
import { useBooru } from "renderer/services/BooruContext";
import { postsQuery, postsStore } from "renderer/stores/posts";
import { useObservable } from "rxjs-hooks";
import * as yup from "yup";

const breakpointColumnsObj = {
  default: 7,
  2000: 6,
  1800: 5,
  1400: 4,
  1260: 3,
  1068: 2,
  768: 1,
};
const schema = yup
  .object({
    search: yup.string().optional(),
  })
  .required();
function Home() {
  const booru = useBooru();
  const posts = useObservable(
    () => postsQuery.selectAll(),
    postsQuery.getAll()
  );
  const selected = useObservable(() => postsQuery.selectActive());
  const isLoading = useObservable(() => postsQuery.selectLoading());
  const onNextHandle = useKeyPress("ArrowRight");
  const onPrevHandle = useKeyPress("ArrowLeft");
  const onEnterHandle = useKeyPress("Enter");
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isValid },
    watch,
  } = useForm({
    defaultValues: {
      search: booru.search,
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
  useEffect(() => {
    if (booru.search) setValue("search", booru.search);
  }, [booru.search]);
  useEffect(() => {
    const active = postsQuery.getActive();
    if (!active) return;
    const index = ((idx) => clamp(idx, 0, idx))(
      postsQuery.getValue().ids?.findIndex((x) => x === active.id) ?? 0
    );
    const ids = postsQuery.getValue().ids || [];
    if (ids.length <= 0) return;
    if (onNextHandle) postsStore.setActive(ids[clamp(index + 1, 0, index + 1)]);
    else if (onPrevHandle)
      postsStore.setActive(ids[clamp(index - 1, 0, index - 1)]);
  }, [onNextHandle, onPrevHandle, onEnterHandle]);
  return (
    <React.Fragment>
      <div className="absolute inset-0 overflow-hidden min-h-0">
        <div className="flex flex-col h-full">
          <div>
            <div className="bg-white bg-opacity-50 backdrop-blur h-16 flex items-center px-2.5 w-full z-10">
              <Controller
                name="search"
                control={control}
                render={({ field }) => {
                  return (
                    <FormControl
                      {...field}
                      placeholder="Search"
                      className="bg-white flex-1"
                      onKeyPress={(ev) => {
                        if (ev.key === "Enter" && isValid)
                          onSubmit(getValues());
                      }}
                    />
                  );
                }}
              />
            </div>
          </div>
          <div className="container overflow-y-auto h-full px-2.5 py-3 bg-black bg-opacity-50">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex -ml-8 w-auto"
              columnClassName="pl-8 bg-clip-padding space-y-6 flex flex-col justify-between items-center">
              {posts?.map((p) => {
                return (
                  <PostThumbnailItem
                    key={p.id}
                    item={p}
                    selected={!!selected && selected.id === p.id}
                  />
                );
              })}
            </Masonry>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
export default Home;
