import Plyr, { PlyrProps } from "plyr-react";
import type { Options as PlyrOptions } from "plyr";
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
import { SpinnerCircular } from "spinners-react";

import { PostViewPreviewProps, PostViewProps } from "./props";
const videoOptions: PlyrOptions = {
  volume: 0.05,
  autoplay: true,
  controls: ["play", "play-large", "progress", "mute", "volume", "fullscreen"],
  hideControls: true,
  loop: {
    active: true,
  },
};
function VideoView({
  setIsLoading,
  isLoading,
  source: sample,
  post,
}: PostViewProps & PostViewPreviewProps) {
  const [error, setError] = useState<any>(null);
  return (
    <div className="mb-8 mt-24">
      <div className="relative flex flex-col justify-center z-0">
        <div className="relative mx-auto inline-block w-96 max-h-container max-w-full shadow-lg select-none group">
          <Plyr
            source={{
              type: "video",
              sources: [{ src: sample, provider: "html5" }],
            }}
            options={videoOptions}></Plyr>
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
      </div>
    </div>
  );
}
export default memo(VideoView);
