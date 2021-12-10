import { useRouter } from "next/dist/client/router";
import React, { useEffect, useRef, useState } from "react";
import { useBooru } from "renderer/services/BooruContext";
import {
  BooruPost,
  FileType,
  postsQuery,
  postsStore,
} from "renderer/stores/posts";
import Button from "@/components/Button";
import {
  audioMatcher,
  classNames,
  copyImage,
  downloadFileAsBlob,
  imageMatcher,
  useCancelToken,
  videoMatcher,
} from "@library/helper";
import { SpinnerCircular } from "spinners-react";
import {
  HiArrowSmRight,
  HiClipboardCopy,
  HiDownload,
  HiExternalLink,
} from "react-icons/hi";
import axios, { AxiosError, CancelToken, CancelTokenSource } from "axios";

interface Props {
  post: BooruPost;
}
interface ViewProps {
  setIsLoading: (v: boolean) => void;
  isLoading?: boolean;
  source: string;
}
function ImageView({
  setIsLoading,
  isLoading,
  source: src,
  post,
}: Props & ViewProps) {
  const imageRef = useRef<HTMLImageElement>();
  const [error, setError] = useState<any>();
  useEffect(() => {
    setError(null);
  }, [src]);
  const [source, setSource] = useState<
    { data: Blob; uri: string } | null | undefined
  >();
  const { newCancelToken, isCancel } = useCancelToken(src);
  useEffect(() => {
    setError(null);
    setSource(null);
    setIsLoading(true);
    downloadFileAsBlob(src, newCancelToken())
      .then((x) => {
        if (error) setError(null);
        setSource(x);
        setIsLoading(false);
      })
      .catch((err: Error | AxiosError) => {
        console.error(err);
        if (axios.isAxiosError(err)) {
          setError(err.message);
        } else if (isCancel(err)) {
          setError(undefined);
        } else {
          setError("Something went wrong");
        }
        setSource(null);
        setIsLoading(false);
      });
    return () => {
      setIsLoading(false);
    };
  }, [src, newCancelToken, isCancel]);
  const handleImageCopy = async () => {
    if (source?.data) await copyImage(source.data);
  };
  return (
    <React.Fragment>
      <div className="mb-8 mt-24">
        <div className="relative flex flex-col justify-center z-0">
          {error ? (
            <div className="max-w-full h-32 w-96 mx-auto shadow-lg xl:rounded-lg bg-white flex flex-col items-center justify-center">
              {typeof error === "string" ? error : "Unable to load image"}
            </div>
          ) : isLoading ? (
            <div className="relative mx-auto inline-block h-64 w-96 max-w-full shadow-lg select-none rounded-lg overflow-hidden group">
              <div className="z-20 absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center backdrop-filter backdrop-blur">
                <SpinnerCircular
                  size={40}
                  thickness={200}
                  color="#000"
                  secondaryColor="transparent"
                />
              </div>
            </div>
          ) : (
            source && (
              <div className="relative mx-auto inline-block w-96 max-w-full shadow-lg select-none group">
                <img
                  src={source.uri}
                  className="align-top pointer-events-none"
                  crossOrigin="anonymous"
                  alt="Post Image"
                  ref={(r) => r && (imageRef.current = r)}
                />
                <div className="absolute top-0 right-0 z-10">
                  <div
                    className="absolute top-0 right-0 w-24 h-24 transform-gpu opacity-0 duration-150 group-hover:opacity-100 rounded-bl-full"
                    style={{
                      background: `linear-gradient(45deg, rgba(0,0,0,0) 15%, rgba(0,0,0,1) 140%)`,
                    }}></div>
                  <div className="h-20 w-20 z-10 flex flex-col justify-center items-center transform-gpu scale-90 opacity-0 duration-150 group-hover:scale-100 group-hover:opacity-100">
                    <button
                      onClick={handleImageCopy}
                      className="text-white cursor-pointer h-full w-full flex flex-col justify-center items-center">
                      <HiClipboardCopy className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

function VideoView({
  setIsLoading,
  isLoading,
  source,
  post,
}: Props & ViewProps) {
  const videoRef = useRef<HTMLVideoElement>();
  const [error, setError] = useState<any>();
  useEffect(() => {
    setError(null);
  }, [source]);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.05;
      videoRef.current.play();
    }
  }, [source]);
  return (
    <React.Fragment>
      <div className="mb-8 mt-24">
        <div className="relative flex flex-col justify-center z-0">
          {error ? (
            <div className="max-w-full h-32 w-96 mx-auto shadow-lg xl:rounded-lg bg-white flex flex-col items-center justify-center">
              Unable to load image
            </div>
          ) : (
            <div className="relative mx-auto inline-block w-96 max-w-full shadow-lg select-none group">
              <video
                src={source}
                controls
                loop
                className="align-top"
                crossOrigin="anonymous"
                onLoadedData={() => setIsLoading(false)}
                onLoadStart={() => setIsLoading(true)}
                preload="metadata"
                ref={(r) => r && (videoRef.current = r)}
              />
              {isLoading && (
                <div className="z-20 absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center backdrop-filter backdrop-blur">
                  <SpinnerCircular
                    size={40}
                    thickness={200}
                    color="#000"
                    secondaryColor="transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
export default function ({ post }: Props) {
  const booru = useBooru();
  const [source, setSource] = useState<string>();
  const postUrl = booru.service?.createPostUrl(post.id);
  const [isLoading, setIsLoading] = useState(false);
  const [fileType, setFileType] = useState<FileType>();
  const testFileType = () => {
    if (!source) setFileType("other");
    else if (imageMatcher.test(source)) setFileType("image");
    else if (videoMatcher.test(source)) setFileType("video");
    else if (audioMatcher.test(source)) setFileType("audio");
    else setFileType("other");
  };
  useEffect(() => {
    if (post.source !== source) {
      setSource(post.sample ?? post.source);
    }
  }, [post]);
  useEffect(() => {
    testFileType();
  }, [source]);
  return (
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
          {source &&
            (fileType === "image" ? (
              <ImageView
                post={post}
                source={source}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
              />
            ) : fileType === "video" ? (
              <VideoView
                post={post}
                source={source}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
              />
            ) : null)}
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
  );
}
