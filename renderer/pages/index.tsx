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
const breakpointColumnsObj = {
  default: 7,
  2000: 6,
  1800: 5,
  1400: 4,
  1260: 3,
  1068: 2,
  768: 1,
};
function Home() {
  const booru = useBooru();
  const posts = useObservable(
    () => postsQuery.selectAll(),
    postsQuery.getAll()
  );
  const selected = useObservable(() => postsQuery.selectActive());
  const onNextHandle = useKeyPress("ArrowRight");
  const onPrevHandle = useKeyPress("ArrowLeft");
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
  }, [onNextHandle, onPrevHandle]);
  return (
    <React.Fragment>
      <div className="absolute inset-0 overflow-hidden min-h-0 bg-black bg-opacity-60">
        <div className="container overflow-y-auto h-full px-2.5 py-3">
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
    </React.Fragment>
  );
}
export default Home;
