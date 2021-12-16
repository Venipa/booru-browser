import { copyImage, downloadFileAsBlob, useCancelToken } from "@library/helper";
import axios, { AxiosError } from "axios";
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
import { HiClipboardCopy } from "react-icons/hi";
import { SpinnerCircular } from "spinners-react";

import { PostViewPreviewProps, PostViewProps } from "./props";

function ImageView({
  setIsLoading,
  isLoading,
  source: src,
  post,
}: PostViewProps & PostViewPreviewProps) {
  const imageRef = useRef<HTMLImageElement>();
  const [error, setError] = useState<any>();
  const { newCancelToken, isCancel } = useCancelToken();
  useEffect(() => {
    setError(null);
  }, [src]);
  const [source, setSource] = useState<
    { data: Blob; uri: string } | null | undefined
  >();
  useEffect(() => {
    setError(null);
    setSource(null);
    setIsLoading(true);
    if (src)
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
            setError(err);
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
              <div className="relative mx-auto inline-block w-96 max-w-full shadow-lg select-none group bg-white bg-opacity-30">
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
export default memo(ImageView);
