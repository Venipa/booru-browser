import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import BaseLayout from "renderer/Layouts/BaseLayout";
import { useBooru } from "renderer/services/BooruContext";
import { useObservable } from "rxjs-hooks";
import { postsQuery, postsStore } from "renderer/stores/posts";
import { classNames } from "@library/helper";
import Image from "next/image";
import { clamp } from "lodash-es";

function Home() {
  const booru = useBooru();
  const posts = useObservable(
    () => postsQuery.selectAll(),
    postsQuery.getAll()
  );
  const selected = useObservable(() => postsQuery.selectActive());
  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript-tailwindcss)</title>
      </Head>
      <div className="container overflow-y-auto h-full">
        {posts?.map((p) => {
          return (
            <div
              className={classNames(
                `bg-black bg-opacity-50 text-white flex w-full items-center gap-2 px-2 py-3 cursor-pointer hover:bg-opacity-60 group select-none`,
                selected && p.id === selected.id ? "bg-purple-800" : null
              )}
              key={p.id}
              onClick={() => postsStore.setActive(p.id)}>
              <div className="flex flex-shrink-0 relative w-24 h-24 group overflow-hidden rounded">
                <img
                  className="w-full h-full object-cover transform transition-transform duration-150 group-hover:scale-110"
                  src={p.thumbnail}
                  alt="Thumbnail"
                />
              </div>
              <div className="flex flex-col leading-none self-start my-1 flex-1">
                <div>{p.id}</div>
                <div>{p.rating}</div>
              </div>
              <div className="flex flex-row self-start my-1">
                {p.score > 0 && new Array(5).fill(<div>⭐</div>, clamp(p.score / 2, 1, 5), 5).filter(Boolean)}
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}
export default Home;
