import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import BaseLayout from "renderer/Layouts/BaseLayout";
import { useBooru } from "renderer/services/BooruContext";
import { useObservable } from "rxjs-hooks";
import { postsQuery, postsStore } from "renderer/stores/posts";
import { classNames, useKeyPress } from "@library/helper";
import Image from "next/image";
import { clamp } from "lodash-es";
import Masonry from "react-masonry-css";
import FormControl from "@/components/FormControl";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { Controller, useForm } from "react-hook-form";
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
  const handleSearch = () => {};
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isValid },
    watch,
  } = useForm({
    defaultValues: {
      search: booru.service?.lastSearch || "",
    },
    resolver: yupResolver(schema),
    reValidateMode: "onBlur",
    mode: "onBlur",
  });
  const onSubmit = (data: typeof schema.__inputType) => {
    postsStore.setLoading(true);
    booru
      .service!.get(1, {
        q: data.search
      })
      .then((x) => {
        postsStore.set(x);
        postsStore.setLoading(false);
      });
  };
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
                  <div
                    className={classNames(
                      `inline-block group mx-auto cursor-pointer`,
                      selected && p.id === selected.id
                        ? "ring-4 rounded ring-purple-500 z-10"
                        : "opacity-60"
                    )}
                    key={p.id}
                    onClick={() => postsStore.setActive(p.id)}>
                    <img
                      className={classNames(
                        "w-full align-top transform transition-transform duration-150 rounded",
                        selected?.id === p.id ? null : "group-hover:scale-105"
                      )}
                      src={p.thumbnail}
                      alt="Thumbnail"
                    />
                  </div>
                );
              })}
              {/* array of JSX items */}
            </Masonry>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
export default Home;
