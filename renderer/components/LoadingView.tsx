import { SpinnerCircular } from "spinners-react";

export default function () {
  return (
    <div className="z-20 absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center backdrop-filter backdrop-blur">
      <SpinnerCircular
        size={40}
        thickness={200}
        color="#000"
        secondaryColor="transparent"
      />
    </div>
  );
}
