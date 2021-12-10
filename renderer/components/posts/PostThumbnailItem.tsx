import { Menu, Popover, Portal, Transition } from "@headlessui/react";
import { classNames } from "@library/helper";
import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import { BooruPost, postsQuery, postsStore } from "renderer/stores/posts";
import Button from "@/components/Button";
import { HiExternalLink } from "react-icons/hi";
import { useBooru } from "renderer/services/BooruContext";
import { useObservable } from "rxjs-hooks";
import { downloadsQuery } from "renderer/stores/downloads";
import { SpinnerCircular } from "spinners-react";
import { map } from "rxjs/operators";
import { usePopper } from "react-popper";
import { createPopper } from "@popperjs/core";

interface Props {
  item: BooruPost;
  selected?: boolean;
  key?: string;
}
function PostItemView({ item: p, selected }: Props) {
  const handleSelect = () => {
    const isActive = postsQuery.hasActive(p.id);
    postsStore.setActive(isActive ? null : p.id);
  };
  return (
    <div
      className={classNames(
        `inline-block group mx-auto cursor-pointer`,
        selected ? "ring-4 rounded ring-purple-500 z-10" : "opacity-60"
      )}
      key={p.id}
      onClick={handleSelect}>
      <img
        className={classNames(
          "w-full align-top transform transition-transform duration-150 rounded",
          selected ? null : "group-hover:scale-105"
        )}
        src={p.thumbnail}
        alt="Thumbnail"
      />
    </div>
  );
}

function RenderItem({ item: p, ...args }: Props) {
  const booru = useBooru();
  const downloadStatus = useObservable(() =>
    downloadsQuery
      .selectAll({
        filterBy: (x) => x.status === "active" || x.status === "pending",
      })
      .pipe(map((x) => x.find(({ post }) => post.id === p.id)))
  );
  const [referenceElement, setReferenceElement] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "right-start",
    strategy: "fixed",
  });

  const [sopen, setOpen] = useState(false);
  const postUrl = booru.service?.createPostUrl(p.id);
  const toggleMenu = () => setOpen(!sopen);
  return (
    <Popover key={args.key} as="div">
      {({open}) => (
        <>
          <Popover.Button
              ref={setReferenceElement}>
            <div
              onContextMenu={() => toggleMenu()}
              className="relative inline-block">
              <PostItemView item={p} {...args} />
            </div>
          </Popover.Button>
            <Transition
              as={Fragment}
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95">
              <Popover.Panel as={Fragment} static>
                <div
                  className={classNames(
                    "w-64 z-50",
                    "max-w-lg bg-white divide-y divide-gray-200 rounded-md shadow-lg focus:outline-none"
                  )}
                  ref={setPopperElement}
                  style={styles.popper}
                  {...attributes.popper}>
                  <div className="space-y-2 flex flex-col truncate my-2">
                    <div className="flex items-center mx-2">
                      <div className="flex-1"></div>
                      {p.source && (
                        <div className="flex-shrink-0">
                          <Button
                            href={postUrl}
                            target="_blank"
                            className="space-x-2">
                            <span>Source</span>
                            <HiExternalLink />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4 mr-2">
                      <div className="flex mr-2 space-x-2 truncate">
                        <p className="flex-1">Artist</p>
                        <span className="truncate">
                          {p.artist || "unknown"}
                        </span>
                      </div>
                      <div className="flex mr-2">
                        <p className="flex-1">Type</p>
                        <span className="truncate">{p.type || "unknown"}</span>
                      </div>
                      {p.refs?.size && (
                        <div className="flex mr-2">
                          <p className="flex-1">Size</p>
                          {p.refs.size < 1000
                            ? `${p.refs.size.toFixed(0)} KB`
                            : `${(p.refs.size / 1024).toFixed(2)} MB`}
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-2.5 focus:outline-none">
                      <Button
                        className="button-nav flex items-center"
                        onClick={() =>
                          booru
                            .addDownload(p)
                            .then(() => open && toggleMenu())
                            .catch(() => open && toggleMenu())
                        }
                        disabled={!!downloadStatus}>
                        <div className="flex-1">Download</div>
                        {!!downloadStatus && (
                          <div className="flex items-center space-x-2">
                            <SpinnerCircular
                              size={20}
                              thickness={350}
                              color="#000"
                              secondaryColor="transparent"
                            />
                          </div>
                        )}
                      </Button>
                      {downloadStatus && (
                        <div className="mt-1 text-right mx-2">
                          {downloadStatus.pogress && (
                            <div className="text-sm leading-none">
                              {downloadStatus.pogress.total < 1000 * 1024
                                ? `${(
                                    downloadStatus.pogress.loaded / 1024
                                  ).toFixed(0)} KB`
                                : `${(
                                    downloadStatus.pogress.loaded /
                                    1024 /
                                    1024
                                  ).toFixed(2)} MB`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
        </>
      )}
    </Popover>
  );
}
export default RenderItem;
