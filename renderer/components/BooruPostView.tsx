import { useRouter } from "next/dist/client/router";
import { useEffect, useRef } from "react";
import { useBooru } from "renderer/services/BooruContext";
import { BooruPost, postsQuery, postsStore } from "renderer/stores/posts";
import Button from "@/components/Button";
import { copyImage } from "@library/helper";
import {
  HiArrowSmRight,
  HiClipboardCopy,
  HiExternalLink,
} from "react-icons/hi";

interface Props {
  post: BooruPost;
}
export default function ({ post }: Props) {
  const booru = useBooru();
  const imageRef = useRef<HTMLImageElement>();
  const postUrl = booru.service?.createPostUrl(post.id);
  const handleImageCopy = async () => {
    if (imageRef.current)
      copyImage(imageRef.current, {
        height: post.height,
        width: post.width,
      });
  };
  return (
    <div className="absolute inset-0 overflow-auto select-none">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <div className="bg-white bg-opacity-50 backdrop-blur h-16 flex items-center px-2.5 mb-8">
            <div className="flex-1"></div>
            <Button onClick={handleImageCopy} className="space-x-2">
              <HiClipboardCopy /> <span>Copy</span>
            </Button>
          </div>
          <div className="relative flex flex-col justify-center">
            <div className="relative mx-auto inline-block w-96 max-w-full shadow-lg select-none group">
              <img
                src={post.source}
                className="align-top pointer-events-none"
                crossOrigin="anonymous"
                alt=""
                ref={(r) => r && (imageRef.current = r)}
              />
              <div className="h-20 w-20 z-10 flex flex-col justify-center items-center absolute top-0 right-0 transform-gpu scale-90 opacity-0 duration-150 group-hover:scale-100 group-hover:opacity-100">
                <Button onClick={handleImageCopy}>
                  <HiClipboardCopy />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-lg flex flex-col flex-1 rounded-t-lg mx-4 px-3.5">
          <div className="my-3">
            <div className="flex items-center">
              <div className="h-10 text-lg flex-1">
                {post.tags?.[0] ?? post.id}
              </div>
              {postUrl && (
                <div className="flex-shrink-0">
                  <Button href={postUrl} target="_blank" className="space-x-2">
                    <span>Source</span>
                    <HiExternalLink />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
