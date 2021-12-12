import Button from "@/components/Button";
import { classNames, testFileType } from "@library/helper";
import React, {
  ComponentPropsWithoutRef,
  Fragment,
  memo,
  PropsWithChildren,
  PropsWithRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { HiDownload, HiExternalLink } from "react-icons/hi";
import { useBooru } from "renderer/services/BooruContext";
import { FileType } from "renderer/stores/posts";

import ImageView from "./ImageView";
import { PostViewPreviewProps, PostViewProps } from "./props";
import VideoView from "./VideoView";

const ContentView = memo(
  (
    contentViewProps: PostViewProps &
      PostViewPreviewProps & { fileType?: string }
  ) => {
    const fileType = contentViewProps.fileType;
    if (fileType === "image") return <ImageView {...contentViewProps} />;
    if (fileType === "video") return <VideoView {...contentViewProps} />;
    return null;
  }
);
function PostView({ post, key }: PostViewProps & { key?: string }) {
  const booru = useBooru();
  const [source, setSource] = useState<string>(post.sample ?? post.source);
  const postUrl = booru.service?.createPostUrl(post.id);
  const [isLoading, setIsLoading] = useState(false);
  const [fileType, setFileType] = useState<FileType>(testFileType(source));
  useEffect(() => {
    if (post.source !== source) {
      const newSource = post.sample ?? post.source;
      setSource(newSource);
      setFileType(testFileType(newSource));
    }
    return () => {
      setSource(null as any);
    };
  }, [post]);
  return (
    <Fragment key={key}>
      <div className="absolute inset-0 select-none">
        <div className="flex flex-col h-full overflow-hidden">
          <div>
            <div className="bg-white bg-opacity-50 backdrop-blur h-16 flex items-center px-2.5 mb-8 absolute top-0 w-full z-10">
              <div className="flex-1"></div>
              <Button
                className="space-x-2"
                onClick={() => booru.addDownload(post, fileType)}>
                <HiDownload /> <span>Download</span>
              </Button>
            </div>
          </div>
          <div className="overflow-auto h-full flex flex-col">
            <ContentView
              post={post}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
              source={source}
              fileType={fileType}
            />
            <div
              className={classNames(
                "bg-white shadow-lg flex flex-col flex-1 rounded-t-lg mx-4 px-3.5",
                fileType === "other" ? "mt-20" : null
              )}>
              <div className="mt-3 mb-10 flex flex-col space-y-2">
                <div className="flex items-center">
                  <div className="h-10 text-lg flex-1 font-semibold">
                    {fileType?.toUpperCase()}
                  </div>
                  {postUrl && (
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
                <div className="flex mr-2">
                  <p className="flex-1">Artist</p>
                  {post.artist || "unknown"}
                </div>
                <div className="flex mr-2">
                  <p className="flex-1">Type</p>
                  {post.type}
                </div>
                {post.refs?.size && (
                  <div className="flex mr-2">
                    <p className="flex-1">Size</p>
                    {post.refs.size < 1000
                      ? `${post.refs.size.toFixed(0)} KB`
                      : `${(post.refs.size / 1024).toFixed(2)} MB`}
                  </div>
                )}
                {post.tags?.length > 0 && (
                  <div className="space-y-4">
                    <div className="h-px w-full bg-gray-200"></div>
                    <div className="flex mr-2 flex-wrap gap-2">
                      {post.tags.map((x) => (
                        <div
                          className="bg-purple-200 text-gray-900 rounded px-2.5 h-8 text-sm leading-none flex items-center justify-center cursor-pointer"
                          onClick={() => booru.service?.get(1, { q: x })}>
                          <span>{x}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
export default memo(PostView);
