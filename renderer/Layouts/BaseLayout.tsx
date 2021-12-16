import Button from "@/components/Button";
import PostView from "@/components/sidebars/PostView";
import Toolbar from "@/components/Toolbar";
import { classNames } from "@library/helper";
import { clamp } from "lodash-es";
import { useRouter } from "next/dist/client/router";
import React, {
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  HiCog,
  HiDownload,
  HiFire,
  HiHome,
  HiServer,
  HiThumbUp,
} from "react-icons/hi";
import { useBooru } from "renderer/services/BooruContext";
import { downloadsQuery } from "renderer/stores/downloads";
import { postsQuery } from "renderer/stores/posts";
import { useObservable } from "rxjs-hooks";

const allowedPostView = new RegExp(/^\/($|hot|top)/);
const navLinks: (
  | { name: string; icon: any; href: string; type: "item" }
  | { type: "divide" }
)[] = [
  {
    name: "Home",
    href: "/",
    icon: <HiHome />,
    type: "item",
  },
  {
    name: "Hot",
    href: "/hot",
    icon: <HiFire />,
    type: "item",
  },
  {
    name: "Top",
    href: "/top",
    icon: <HiThumbUp />,
    type: "item",
  },
  {
    type: "divide",
  },
  {
    name: "Downloads",
    href: "/downloads",
    icon: <HiDownload />,
    type: "item",
  },
  {
    name: "Servers",
    href: "/servers",
    icon: <HiServer />,
    type: "item",
  },
  {
    type: "divide",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: <HiCog />,
    type: "item",
  },
];
export default function ({ children, ...props }: PropsWithChildren<any>) {
  const { asPath } = useRouter();
  const booru = useBooru();
  const [showSelected, setShowSelected] = useState(
    allowedPostView.test(asPath)
  );
  const downloadCount = useObservable(
    () =>
      downloadsQuery.selectCount(
        (x) => !!x.status && ["active", "pending"].includes(x.status)
      ),
    0
  );
  useLayoutEffect(() => {
    const _shouldShow = allowedPostView.test(asPath);
    if (showSelected !== _shouldShow) setShowSelected(_shouldShow);
  }, [asPath]);
  return (
    <>
      <Toolbar></Toolbar>
      <div className={classNames("h-full w-full flex")}>
        <div className="sidebar flex flex-col gap-8 py-4 w-sidebar flex-shrink-0">
          <div className="sidebar-content">
            {navLinks
              .map((x, i) => {
                if (x.type === "divide")
                  return (
                    <div
                      key={`${x.type}${i}`}
                      className="bg-black bg-opacity-5 w-full h-px"></div>
                  );
                if (x.type === "item")
                  return (
                    <div className="relative" key={x.href}>
                      <Button
                        className={classNames(
                          "button-nav gap-1",
                          asPath === x.href ? "active" : null
                        )}
                        href={x.href}>
                        {x.icon}
                        <span>{x.name}</span>
                      </Button>
                      {x.href.match("/downloads") && downloadCount > 0 && (
                        <div className="bg-red-600 w-4 h-4 rounded-full flex flex-col justify-center items-center top-0 right-0 absolute">
                          <span className="text-xxs text-white">
                            {clamp(downloadCount, 1, 99)}
                          </span>
                        </div>
                      )}
                    </div>
                  );

                return null;
              })
              .filter(Boolean)}
          </div>
        </div>
        <div className="relative h-full w-full">
          <div className="inset-0 absolute">{children}</div>
        </div>
        {showSelected && booru.activePost && (
          <>
            <div className="relative h-full w-previewPane xl:w-previewPaneMax">
              <div className="inset-0 absolute">
                <PostView post={booru.activePost} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
