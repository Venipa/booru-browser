import BooruPostView from "@/components/BooruPostView";
import Button from "@/components/Button";
import Toolbar from "@/components/Toolbar";
import { classNames } from "@library/helper";
import { useRouter } from "next/dist/client/router";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  HiHome,
  HiThumbUp,
  HiFire,
  HiDownload,
  HiServer,
} from "react-icons/hi";
import { postsQuery } from "renderer/stores/posts";
import { useObservable } from "rxjs-hooks";
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
];
export default function ({ children, ...props }: PropsWithChildren<any>) {
  const { asPath } = useRouter();
  const [showSelected, setShowSelected] = useState(false);
  const selected = useObservable(() => postsQuery.selectActive());
  useEffect(() => {
    setShowSelected(!!asPath.match(/^\/($|hot|top)/));
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
                    <Button
                      key={x.href}
                      className={classNames(
                        "button-nav gap-1",
                        asPath === x.href ? "active" : null
                      )}
                      href={x.href}>
                      {x.icon}
                      <span>{x.name}</span>
                    </Button>
                  );

                return null;
              })
              .filter(Boolean)}
          </div>
        </div>
        <div className="relative h-full w-full">
          <div className="inset-0 absolute">{children}</div>
        </div>
        {showSelected && selected && (
          <div className="relative h-full w-previewPane xl:w-previewPaneMax">
            <div className="inset-0 absolute">
              <BooruPostView post={selected} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
